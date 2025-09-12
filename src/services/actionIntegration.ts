import { useModalStore } from '@/stores/modalStore';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { conversationMemory, type RecommendedAction, type CompletedAction } from './memory/conversationMemory';

export interface ActionIntegration {
  executeAction: (action: RecommendedAction, sessionId: string) => Promise<ActionResult>;
  openActionModal: (action: RecommendedAction) => void;
  validateAction: (action: RecommendedAction) => ActionValidation;
  estimateOutcome: (action: RecommendedAction) => Promise<ActionEstimate>;
}

export interface ActionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  actualOutcome?: {
    healthFactorChange?: number;
    netWorthChange?: number;
    newAPY?: number;
    gasUsed?: string;
  };
}

export interface ActionValidation {
  isValid: boolean;
  warnings: string[];
  blockers: string[];
  recommendations: string[];
}

export interface ActionEstimate {
  estimatedGas: string;
  priceImpact: number;
  timeToComplete: string;
  expectedOutcome: {
    healthFactorChange?: number;
    netWorthChange?: number;
    newAPY?: number;
  };
  risks: string[];
  benefits: string[];
}

class ActionIntegrationService implements ActionIntegration {
  private modalStore: any = null;
  private marketStore: any = null;

  setStores(modalStore: ReturnType<typeof useModalStore>, marketStore: ReturnType<typeof useContractMarketStore>) {
    this.modalStore = modalStore;
    this.marketStore = marketStore;
  }

  async executeAction(action: RecommendedAction, sessionId: string): Promise<ActionResult> {
    try {
      const validation = this.validateAction(action);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Action validation failed: ${validation.blockers.join(', ')}`
        };
      }

      conversationMemory.recordActionConsideration(sessionId, {
        action: action.action,
        asset: action.asset,
        amount: action.amount,
        timestamp: Date.now(),
        reasoning: action.reasoning,
        outcome: 'proceeded'
      });

      this.openActionModal(action);

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Action execution error:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error occurred'
      };
    }
  }

  openActionModal(action: RecommendedAction): void {
    if (!this.modalStore || !this.marketStore) {
      console.error('Stores not initialized');
      return;
    }

    const market = this.marketStore.getMarketById(action.asset.toLowerCase());
    if (!market) {
      console.error(`Market not found for asset: ${action.asset}`);
      return;
    }

    const modalData: any = {
      market,
      suggestedAmount: action.amount,
      reasoning: action.reasoning,
      aiRecommended: true
    };

    switch (action.action) {
      case 'supply':
        this.modalStore.openModal('supply', modalData);
        break;
      case 'borrow':
        this.modalStore.openModal('borrow', modalData);
        break;
      case 'withdraw':
        this.modalStore.openModal('withdraw', {
          ...modalData,
          currentSupply: action.amount,
          maxWithdraw: action.amount
        });
        break;
      case 'repay':
        this.modalStore.openModal('repay', {
          ...modalData,
          currentDebt: action.amount,
          totalDebt: action.amount
        });
        break;
      default:
        console.error(`Unsupported action: ${action.action}`);
    }
  }

  validateAction(action: RecommendedAction): ActionValidation {
    const warnings: string[] = [];
    const blockers: string[] = [];
    const recommendations: string[] = [];

    if (action.amount <= 0) {
      blockers.push('Amount must be greater than zero');
    }

    if (!this.marketStore) {
      blockers.push('Market data not available');
      return { isValid: false, warnings, blockers, recommendations };
    }

    const market = this.marketStore.getMarketById(action.asset.toLowerCase());
    if (!market) {
      blockers.push(`Market not found for asset: ${action.asset}`);
      return { isValid: false, warnings, blockers, recommendations };
    }

    if (!market.isActive) {
      blockers.push(`Market for ${action.asset} is not currently active`);
    }

    switch (action.action) {
      case 'supply':
        if (market.isCollateralOnly && action.asset !== 'KAIA') {
          warnings.push('This asset can only be used as collateral');
        }
        break;
      case 'borrow':
        if (market.isCollateralOnly) {
          blockers.push(`${action.asset} cannot be borrowed, only used as collateral`);
        }
        if (market.utilization > 95) {
          warnings.push('High utilization - borrowing may be expensive');
        }
        break;
      case 'withdraw':
        recommendations.push('Ensure you maintain sufficient collateral for any borrowing positions');
        break;
      case 'repay':
        recommendations.push('Repaying debt improves your health factor and reduces interest costs');
        break;
    }

    if (action.riskLevel === 'high') {
      warnings.push('This is a high-risk action - proceed with caution');
    }

    if (action.amount > 10000) {
      warnings.push('Large transaction amount - consider splitting into smaller transactions');
    }

    return {
      isValid: blockers.length === 0,
      warnings,
      blockers,
      recommendations
    };
  }

  async estimateOutcome(action: RecommendedAction): Promise<ActionEstimate> {
    const market = this.marketStore?.getMarketById(action.asset.toLowerCase());
    if (!market) {
      throw new Error(`Market not found for ${action.asset}`);
    }

    const estimatedGas = this.estimateGasCost(action.action);
    const priceImpact = this.calculatePriceImpact(action.amount, market);

    let healthFactorChange = 0;
    let netWorthChange = 0;
    let newAPY = 0;

    switch (action.action) {
      case 'supply':
        netWorthChange = action.amount;
        newAPY = market.supplyAPY || 0;
        healthFactorChange = 0.1;
        break;
      case 'borrow':
        netWorthChange = action.amount;
        newAPY = -(market.borrowAPR || 0);
        healthFactorChange = -0.2;
        break;
      case 'withdraw':
        netWorthChange = -action.amount;
        healthFactorChange = -0.1;
        break;
      case 'repay':
        netWorthChange = -action.amount;
        healthFactorChange = 0.3;
        break;
    }

    const risks = this.identifyRisks(action, market);
    const benefits = this.identifyBenefits(action, market);

    return {
      estimatedGas,
      priceImpact,
      timeToComplete: '30-60 seconds',
      expectedOutcome: {
        healthFactorChange,
        netWorthChange,
        newAPY
      },
      risks,
      benefits
    };
  }

  private estimateGasCost(action: string): string {
    const gasEstimates = {
      supply: '150,000',
      borrow: '200,000',
      withdraw: '180,000',
      repay: '160,000'
    };
    return gasEstimates[action as keyof typeof gasEstimates] || '150,000';
  }

  private calculatePriceImpact(amount: number, market: any): number {
    const tvl = (market.totalSupply || 0) + (market.totalBorrow || 0);
    if (tvl === 0) return 0;

    const impactPercent = (amount / tvl) * 100;
    return Math.min(impactPercent, 5);
  }

  private identifyRisks(action: RecommendedAction, market: any): string[] {
    const risks: string[] = ['Smart contract risk', 'Market volatility risk'];

    switch (action.action) {
      case 'supply':
        if (market.utilization > 90) {
          risks.push('High utilization may affect withdrawability');
        }
        break;
      case 'borrow':
        risks.push('Liquidation risk if collateral value drops');
        risks.push('Interest rate fluctuation risk');
        break;
      case 'withdraw':
        risks.push('Reduced earning potential');
        if (action.riskLevel === 'high') {
          risks.push('May impact collateral ratio');
        }
        break;
    }
    return risks;
  }

  private identifyBenefits(action: RecommendedAction, market: any): string[] {
    const benefits: string[] = [];

    switch (action.action) {
      case 'supply':
        benefits.push(`Earn ${(market.supplyAPY || 0).toFixed(2)}% APY`);
        benefits.push('Contribute to protocol liquidity');
        if (market.symbol === 'KAIA') {
          benefits.push('Can be used as collateral for borrowing');
        }
        break;
      case 'borrow':
        benefits.push('Access to liquidity without selling assets');
        benefits.push('Potential for leveraged positions');
        break;
      case 'withdraw':
        benefits.push('Access to your supplied funds');
        benefits.push('Reduced exposure to protocol risk');
        break;
      case 'repay':
        benefits.push('Improved health factor');
        benefits.push('Reduced interest payments');
        benefits.push('Lower liquidation risk');
        break;
    }
    return benefits;
  }

  recordTransactionCompletion(sessionId: string, action: RecommendedAction, result: ActionResult): void {
    const completedAction: CompletedAction = {
      action: action.action,
      asset: action.asset,
      amount: action.amount,
      timestamp: Date.now(),
      txHash: result.txHash,
      result: result.success ? 'success' : 'failed',
      impactOnPortfolio: result.actualOutcome || {}
    };

    conversationMemory.recordCompletedAction(sessionId, completedAction);

    if (action.id) {
      conversationMemory.updateRecommendationStatus(
        sessionId,
        action.id,
        result.success ? 'accepted' : 'declined'
      );
    }
  }
}

export const actionIntegration = new ActionIntegrationService();
