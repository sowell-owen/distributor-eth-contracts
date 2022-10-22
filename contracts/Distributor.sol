// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Distributor {
    function distributeEtherEqualAmount(
        address payable[] memory _recipients,
        uint256 _amount
    ) external payable {
        for (uint256 i = 0; i < _recipients.length; i++) {
            _recipients[i].transfer(_amount);
        }
    }

    function distributeEther(
        address payable[] memory _recipients,
        uint256[] memory _amounts
    ) external payable {
        for (uint256 i = 0; i < _recipients.length; i++) {
            _recipients[i].transfer(_amounts[i]);
        }
    }

    function distributeERC20EqualAmount(
        IERC20 _token,
        address[] memory _recipients,
        uint256 _amount
    ) external payable {
        uint256 totalAmountToSend = _amount * _recipients.length;
        require(
            _token.transferFrom(msg.sender, address(this), totalAmountToSend)
        );

        for (uint256 i = 0; i < _recipients.length; i++) {
            _token.transfer(_recipients[i], _amount);
        }
    }

    function distributeERC20(
        IERC20 _token,
        address[] memory _recipients,
        uint256[] memory _amounts
    ) external payable {
        uint256 totalAmountToSend = 0;
        for (uint256 i = 0; i < _recipients.length; i++) {
            totalAmountToSend += _amounts[i];
        }
        require(
            _token.transferFrom(msg.sender, address(this), totalAmountToSend)
        );

        for (uint256 i = 0; i < _recipients.length; i++) {
            _token.transfer(_recipients[i], _amounts[i]);
        }
    }

    receive() external payable {}
}
