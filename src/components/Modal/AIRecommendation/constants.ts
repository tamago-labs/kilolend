export const PROMPT_TEMPLATES = [
    // English
    "I have 100 USDT, what’s the safest way to earn yield?",
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
    "USDTを使ってBORAを借りたいです"
  ];
  
export interface AIRecommendationModalProps {
    isOpen: boolean;
    onClose: () => void;
}
