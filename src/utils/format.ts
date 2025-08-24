export const keiHexToKaiaDecimal: (hex:string) => string = (hex:string) => {
    const clean = hex.startsWith("0x") || hex.startsWith("0X") ? hex.slice(2) : hex;
    if (clean === "") return "0";

    const kei: bigint = BigInt("0x"+clean);

    const TEN18 = BigInt(10) ** BigInt(18);

    const whole = kei / TEN18;           // integer kaia part
    const rem = kei % TEN18;             // remainder in kei for fractional part

    if (rem === BigInt(0)) {
        return whole.toString();           // exact integer
    }

    // build fractional part with leading zeros to 18 digits
    const fracRaw = rem.toString().padStart(18, "0"); // decimal string of remainder
    // trim trailing zeros
    const fracTrimmed = fracRaw.replace(/0+$/g, "");
    return `${whole.toString()}.${fracTrimmed}`;
};

export const microUSDTHexToUSDTDecimal = (hex:string) => {

    const clean = hex.startsWith("0x") || hex.startsWith("0X") ? hex.slice(2) : hex;
    if (clean === "") return "0";
    const microUSDT = BigInt('0x'+clean);

    const TEN6 = BigInt(1000000);

    const whole = microUSDT / TEN6;
    const rem = microUSDT % TEN6;

    if(rem === BigInt(0)) {
        return whole.toString();
    }

    const fracRaw = rem.toString().padStart(6, "0");
    const fracTrimmed = fracRaw.replace(/0+$/g, "");
    return `${whole.toString()}.${fracTrimmed}`;
}

// Generic token balance formatter based on decimals
export const formatTokenBalance = (hexBalance: string, decimals: number): string => {
    const clean = hexBalance.startsWith("0x") || hexBalance.startsWith("0X") ? hexBalance.slice(2) : hexBalance;
    if (clean === "") return "0";
    
    const balance = BigInt('0x' + clean);
    
    if (decimals === 0) {
        return balance.toString();
    }
    
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = balance / divisor;
    const rem = balance % divisor;
    
    if (rem === BigInt(0)) {
        return whole.toString();
    }
    
    const fracRaw = rem.toString().padStart(decimals, "0");
    const fracTrimmed = fracRaw.replace(/0+$/g, "");
    return `${whole.toString()}.${fracTrimmed}`;
};

// Specific formatters for each token type
export const formatUSDTBalance = (hexBalance: string) => formatTokenBalance(hexBalance, 6);
export const formatKRWBalance = (hexBalance: string) => formatTokenBalance(hexBalance, 0);
export const formatJPYBalance = (hexBalance: string) => formatTokenBalance(hexBalance, 0);
export const formatTHBBalance = (hexBalance: string) => formatTokenBalance(hexBalance, 2);
export const formatStKAIABalance = (hexBalance: string) => formatTokenBalance(hexBalance, 18);
export const formatWKAIABalance = (hexBalance: string) => formatTokenBalance(hexBalance, 18);

// Format balance for display with proper precision
export const formatBalanceDisplay = (balance: string, decimals: number): string => {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0';
    
    if (decimals === 0) {
        return num.toLocaleString();
    } else if (decimals <= 2) {
        return num.toFixed(2);
    } else if (decimals <= 6) {
        return num.toFixed(4);
    } else {
        return num.toFixed(6);
    }
};