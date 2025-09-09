// Enhanced constants with Thai language and KiloLend-specific templates
// File: /src/components/Modal/AIRecommendation/constants.ts

export interface AIRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Legacy template array for backward compatibility
export const PROMPT_TEMPLATES = [
  // English
  "I have 100 USDT, what's the safest way to earn yield?",
  "I want to borrow USDT using KAIA as collateral",
  "Which is better for lending: SIX Network, MBX, or BORA?",
  "I want to borrow BORA using USDT",
  "Suggest a balanced lending strategy with 500 USDT",
  "How should I split 300 USDT between KAIA and MBX for lending?",

  // Korean
  "나는 100 USDT가 있어요. KiloLend에서 안전하게 수익을 얻는 방법은?",
  "USDT를 KAIA를 담보로 빌리고 싶어요",
  "SIX Network, MBX, BORA 중 어디에 대출하는 것이 좋을까요?",
  "USDT로 BORA를 빌리고 싶어요",

  // Japanese
  "私は100 USDTを持っています。KiloLendで安全に利回りを得るには？",
  "USDTをKAIAを担保に借りたいです",
  "SIX Network、MBX、BORAのどれに貸すのが最適ですか？",
  "USDTを使ってBORAを借りたいです",

  // Thai (New)
  "ฉันมี 100 USDT อยากหาวิธีหาผลตอบแทนที่ปลอดภัยที่สุด",
  "อยากกู้ USDT โดยใช้ KAIA เป็นหลักประกัน",
  "SIX Network, MBX หรือ BORA อันไหนดีกว่าสำหรับการให้กู้?",
  "อยากใช้ USDT กู้ BORA"
];

// Enhanced template categorization with Thai language
export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  templates: {
    en: string[];
    ko: string[];
    ja: string[];
    th: string[]; // Added Thai
  };
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'conservative',
    name: 'Conservative & Safe',
    description: 'Low-risk strategies focused on capital preservation and steady returns with stablecoins',
    icon: 'Shield',
    color: '#22c55e',
    templates: {
      en: [
        "I have 100 USDT, what's the safest way to earn yield on KiloLend?",
        "Show me low-risk stablecoin lending strategies for steady income",
        "What are the most secure assets to supply on KiloLend with KAIA collateral?",
        "I'm new to DeFi, suggest the safest way to start earning with 50 USDT",
        "How can I earn 4-6% APY with minimal risk on KiloLend?"
      ],
      ko: [
        "나는 100 USDT가 있어요. KiloLend에서 안전하게 수익을 얻는 방법은?",
        "안정적인 수익을 위한 저위험 스테이블코인 대출 전략을 제안해주세요",
        "KiloLend에서 KAIA 담보로 가장 안전한 자산은 무엇인가요?",
        "DeFi 초보자입니다, 50 USDT로 안전하게 시작하는 방법은?",
        "KiloLend에서 최소 위험으로 4-6% 수익률을 얻으려면?"
      ],
      ja: [
        "私は100 USDTを持っています。KiloLendで安全に利回りを得るには？",
        "安定した収入のための低リスクステーブルコイン貸出戦略を提案してください",
        "KiloLendでKAIA担保で最も安全な資産は何ですか？",
        "DeFi初心者です、50 USDTで安全に始める方法は？",
        "KiloLendで最小リスクで4-6%の利回りを得るには？"
      ],
      th: [
        "ฉันมี 100 USDT อยากหาวิธีหาผลตอบแทนที่ปลอดภัยที่สุดใน KiloLend",
        "แนะนำกลยุทธ์การให้กู้ stablecoin ที่มีความเสี่ยงต่ำสำหรับรายได้คงที่",
        "สินทรัพย์ไหนที่ปลอดภัยที่สุดใน KiloLend โดยใช้ KAIA เป็นหลักประกัน?",
        "ฉันเป็นมือใหม่ใน DeFi แนะนำวิธีเริ่มต้นที่ปลอดภัยด้วย 50 USDT",
        "จะหาผลตอบแทน 4-6% ต่อปีด้วยความเสี่ยงน้อยที่สุดใน KiloLend ได้อย่างไร?"
      ]
    }
  },
  {
    id: 'borrowing',
    name: 'Borrowing & Leverage',
    description: 'Strategic borrowing using KAIA collateral to access gaming tokens and stablecoins',
    icon: 'TrendingUp',
    color: '#3b82f6',
    templates: {
      en: [
        "I want to borrow USDT using KAIA as collateral on KiloLend",
        "How can I leverage my KAIA holdings to borrow gaming tokens like MBX or BORA?",
        "What's the optimal collateral ratio for borrowing on KiloLend?",
        "I have 1000 KAIA, show me safe borrowing strategies",
        "Help me understand liquidation risks when borrowing against KAIA",
        "I want to borrow MBX for gaming investments using my KAIA",
        "Show me the best borrowing opportunities with current KAIA collateral rates"
      ],
      ko: [
        "KiloLend에서 KAIA를 담보로 USDT를 빌리고 싶어요",
        "KAIA 보유량을 활용해서 MBX나 BORA 같은 게이밍 토큰을 빌리려면?",
        "KiloLend에서 차용을 위한 최적의 담보 비율은?",
        "1000 KAIA가 있습니다, 안전한 차용 전략을 보여주세요",
        "KAIA 담보 대출 시 청산 위험을 이해하고 싶어요",
        "게이밍 투자를 위해 KAIA로 MBX를 빌리고 싶어요",
        "현재 KAIA 담보율로 가장 좋은 차용 기회를 보여주세요"
      ],
      ja: [
        "KiloLendでKAIAを担保にUSDTを借りたいです",
        "KAIA保有量を活用してMBXやBORAなどのゲーミングトークンを借りるには？",
        "KiloLendでの借入のための最適な担保比率は？",
        "1000 KAIAがあります、安全な借入戦略を教えてください",
        "KAIA担保借入時の清算リスクを理解したいです",
        "ゲーミング投資のためにKAIAでMBXを借りたいです",
        "現在のKAIA担保レートで最良の借入機会を教えてください"
      ],
      th: [
        "อยากกู้ USDT โดยใช้ KAIA เป็นหลักประกันใน KiloLend",
        "จะใช้ KAIA ที่ถือเพื่อกู้โทเค็นเกมมิ่งอย่าง MBX หรือ BORA ได้อย่างไร?",
        "อัตราส่วนหลักประกันที่เหมาะสมสำหรับการกู้ใน KiloLend คือเท่าไหร่?",
        "ฉันมี 1000 KAIA แนะนำกลยุทธ์การกู้ที่ปลอดภัย",
        "ช่วยอธิบายความเสี่ยงการปิดฐานะเมื่อใช้ KAIA เป็นหลักประกัน",
        "อยากใช้ KAIA กู้ MBX เพื่อลงทุนในเกมมิ่ง",
        "แสดงโอกาสการกู้ที่ดีที่สุดด้วยอัตราหลักประกัน KAIA ปัจจุบัน"
      ]
    }
  },
  // {
  //   id: 'gaming',
  //   name: 'Gaming Tokens Strategy',
  //   description: 'Specialized strategies for gaming ecosystem tokens like MBX, BORA, and SIX',
  //   icon: 'Gamepad2',
  //   color: '#f59e0b',
  //   templates: {
  //     en: [
  //       "Which gaming token is better for lending: MBX, BORA, or SIX Network?",
  //       "I want to build a gaming token portfolio with USDT on KiloLend",
  //       "Help me choose between MBX and BORA for high-yield strategies",
  //       "What are the risks of lending gaming tokens vs stablecoins?",
  //       "I believe in gaming sector growth, suggest optimal allocation strategy",
  //       "Compare APY rates for all gaming tokens available on KiloLend"
  //     ],
  //     ko: [
  //       "MBX, BORA, SIX Network 중 어떤 게이밍 토큰이 대출에 좋을까요?",
  //       "KiloLend에서 USDT로 게이밍 토큰 포트폴리오를 만들고 싶어요",
  //       "고수익 전략을 위해 MBX와 BORA 중 선택을 도와주세요",
  //       "게이밍 토큰 대출 vs 스테이블코인의 위험은 무엇인가요?",
  //       "게이밍 섹터 성장을 믿어요, 최적의 배분 전략을 제안해주세요",
  //       "KiloLend에서 제공하는 모든 게이밍 토큰의 APY를 비교해주세요"
  //     ],
  //     ja: [
  //       "MBX、BORA、SIX Networkのどのゲーミングトークンが貸出に良いですか？",
  //       "KiloLendでUSDTを使ってゲーミングトークンポートフォリオを作りたいです",
  //       "高利回り戦略のためにMBXとBORAの選択を手伝ってください",
  //       "ゲーミングトークン貸出 vs ステーブルコインのリスクは何ですか？",
  //       "ゲーミングセクターの成長を信じています、最適な配分戦略を提案してください",
  //       "KiloLendで利用可能なすべてのゲーミングトークンのAPYを比較してください"
  //     ],
  //     th: [
  //       "โทเค็นเกมมิ่งไหนดีกว่าสำหรับการให้กู้: MBX, BORA หรือ SIX Network?",
  //       "อยากสร้างพอร์ตโฟลิโอโทเค็นเกมมิ่งด้วย USDT ใน KiloLend",
  //       "ช่วยเลือกระหว่าง MBX และ BORA สำหรับกลยุทธ์ผลตอบแทนสูง",
  //       "ความเสี่ยงของการให้กู้โทเค็นเกมมิ่ง vs stablecoin คืออะไร?",
  //       "เชื่อในการเติบโตของภาคเกมมิ่ง แนะนำกลยุทธ์การจัดสรรที่เหมาะสม",
  //       "เปรียบเทียบอัตรา APY ของโทเค็นเกมมิ่งทั้งหมดใน KiloLend"
  //     ]
  //   }
  // },
  {
    id: 'advanced',
    name: 'Portfolio',
    description: 'Sophisticated multi-asset strategies and portfolio optimization on KiloLend',
    icon: 'Zap',
    color: '#8b5cf6',
    templates: {
      en: [
        "Suggest a balanced lending portfolio with 500 USDT across KiloLend markets",
        "How should I split 1000 USDT between KAIA collateral and gaming token lending?",
        "Create a risk-balanced strategy using KAIA, USDT, and one gaming token",
        "I have mixed portfolio goals: 70% stable income, 30% growth. Help optimize on KiloLend",
        "Design a strategy to maximize yield while maintaining health factor above 2.0",
        "Help me rebalance my current KiloLend positions for better risk-reward ratio"
      ],
      ko: [
        "KiloLend 마켓에서 500 USDT로 균형 잡힌 대출 포트폴리오를 제안해주세요",
        "1000 USDT를 KAIA 담보와 게이밍 토큰 대출에 어떻게 나누어야 할까요?",
        "KAIA, USDT, 게이밍 토큰 하나를 사용한 위험 균형 전략을 만들어주세요",
        "혼합 포트폴리오 목표가 있어요: 70% 안정 수익, 30% 성장. KiloLend에서 최적화 도움",
        "건강지수 2.0 이상을 유지하면서 수익률을 최대화하는 전략을 설계해주세요",
        "더 나은 위험-보상 비율을 위해 현재 KiloLend 포지션 재조정을 도와주세요"
      ],
      ja: [
        "KiloLendマーケットで500 USDTを使ったバランスの取れた貸出ポートフォリオを提案してください",
        "1000 USDTをKAIA担保とゲーミングトークン貸出にどのように分けるべきですか？",
        "KAIA、USDT、ゲーミングトークン1つを使ったリスクバランス戦略を作ってください",
        "混合ポートフォリオ目標があります：70%安定収入、30%成長。KiloLendで最適化を手伝って",
        "ヘルスファクター2.0以上を維持しながら利回りを最大化する戦略を設計してください",
        "より良いリスク・リワード比率のために現在のKiloLendポジションのリバランスを手伝って"
      ],
      th: [
        "แนะนำพอร์ตโฟลิโอการให้กู้ที่สมดุลด้วย 500 USDT ในตลาด KiloLend",
        "ควรแบ่ง 1000 USDT ระหว่างหลักประกัน KAIA และการให้กู้โทเค็นเกมมิ่งอย่างไร?",
        "สร้างกลยุทธ์สมดุลความเสี่ยงโดยใช้ KAIA, USDT และโทเค็นเกมมิ่งหนึ่งตัว",
        "เป้าหมายพอร์ตโฟลิโอผสม: รายได้คงที่ 70%, การเติบโต 30% ช่วยปรับให้เหมาะสมใน KiloLend",
        "ออกแบบกลยุทธ์เพื่อเพิ่มผลตอบแทนสูงสุดโดยรักษาสุขภาพพอร์ตเกิน 2.0",
        "ช่วยปรับสมดุลตำแหน่ง KiloLend ปัจจุบันเพื่ออัตราส่วนความเสี่ยง-ผลตอบแทนที่ดีกว่า"
      ]
    }
  }
];

// Language options with Thai added
export interface LanguageOption {
  code: 'en' | 'ko' | 'ja' | 'th';
  name: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' }
];

// Helper function to get templates by category and language
export const getTemplatesByCategory = (categoryId: string, language: 'en' | 'ko' | 'ja' | 'th'): string[] => {
  const category = TEMPLATE_CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.templates[language] : [];
};

// Helper function to get total template count by category
export const getTemplateCategoryStats = () => {
  return TEMPLATE_CATEGORIES.map(category => ({
    id: category.id,
    name: category.name,
    totalTemplates: Object.values(category.templates).reduce((sum, templates) => sum + templates.length, 0),
    byLanguage: {
      en: category.templates.en.length,
      ko: category.templates.ko.length,
      ja: category.templates.ja.length,
      th: category.templates.th.length
    }
  }));
};

// KiloLend-specific context for templates
export const KILOLEND_CONTEXT = {
  name: "KiloLend",
  description: "Stablecoin-focused DeFi lending protocol on KAIA blockchain",
  supportedAssets: {
    stablecoins: ["USDT"],
    gamingTokens: ["MBX", "BORA", "SIX"],
    collateral: ["KAIA"]
  },
  features: [
    "AI-powered recommendations",
    "Multi-language support",
    "LINE Mini Dapp integration",
    "Pyth Oracle price feeds",
    "Dynamic interest rates"
  ],
  riskFactors: [
    "Smart contract risk",
    "Gaming token volatility",
    "KAIA price fluctuations",
    "Liquidation risk for borrowers",
    "Protocol governance changes"
  ]
};