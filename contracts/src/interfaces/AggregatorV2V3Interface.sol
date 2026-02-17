// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

/**
 * @title AggregatorV2V3Interface
 * @notice Interface for Chainlink-style price aggregators (used by BKC Chain, Etherlink, etc.)
 * @dev Compatible with both Chainlink V2 and V3 aggregator interfaces
 * 
 * This interface is used to interact with price feeds from:
 * - BKC Chain
 * - Etherlink
 * - Other chains using Chainlink-style aggregators
 */
interface AggregatorV2V3Interface {
    /**
     * @notice Returns the number of decimals used by the price feed
     * @dev BKC Chain and Etherlink typically use 8 decimals
     * @return Number of decimals
     */
    function decimals() external view returns (uint8);
    
    /**
     * @notice Returns the description of the price feed
     * @return Description string (e.g., "BTC/USD")
     */
    function description() external view returns (string memory);
    
    /**
     * @notice Returns the version of the aggregator
     * @return Version number
     */
    function version() external view returns (uint256);
    
    /**
     * @notice Returns the latest round data
     * @dev This is the main function to get price data from the aggregator
     * @return roundId The round ID
     * @return answer The price (aggregated answer)
     * @return startedAt Timestamp when the round started
     * @return updatedAt Timestamp when the round was updated
     * @return answeredInRound The round ID when the answer was submitted
     */
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}