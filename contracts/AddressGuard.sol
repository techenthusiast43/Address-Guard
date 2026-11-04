// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AddressGuard
 * @notice Personal trusted wallet address manager on BOT Chain.
 * @dev Manages an isolated list of trusted addresses per wallet owner with O(1) removals.
 */
contract AddressGuard {
    struct TrustedAddress {
        address wallet;
        string label;
        string category;
        uint256 addedAt;
    }

    // Mapping from owner => list of trusted address entries
    mapping(address => TrustedAddress[]) private _userAddresses;

    // Mapping from owner => wallet => 1-based index in _userAddresses
    mapping(address => mapping(address => uint256)) private _addressIndices;

    // Events
    event AddressAdded(
        address indexed owner,
        address indexed wallet,
        string label,
        string category,
        uint256 addedAt
    );
    event AddressRemoved(address indexed owner, address indexed wallet);
    event LabelUpdated(address indexed owner, address indexed wallet, string newLabel);
    event CategoryUpdated(address indexed owner, address indexed wallet, string newCategory);

    // Custom errors for gas efficiency
    error ZeroAddressNotAllowed();
    error EmptyLabelNotAllowed();
    error AddressAlreadyExists(address wallet);
    error AddressNotFound(address wallet);

    /**
     * @notice Add a trusted address with custom label and category.
     * @param wallet The address to trust.
     * @param label The custom user-defined label.
     * @param category Category name (e.g., Personal, Friends, Exchanges, Projects).
     */
    function addTrustedAddressWithCategory(
        address wallet,
        string memory label,
        string memory category
    ) public {
        if (wallet == address(0)) revert ZeroAddressNotAllowed();
        if (bytes(label).length == 0) revert EmptyLabelNotAllowed();
        if (_addressIndices[msg.sender][wallet] != 0) revert AddressAlreadyExists(wallet);

        string memory cat = bytes(category).length == 0 ? "Personal" : category;
        uint256 timestamp = block.timestamp;

        _userAddresses[msg.sender].push(
            TrustedAddress({
                wallet: wallet,
                label: label,
                category: cat,
                addedAt: timestamp
            })
        );

        // Store 1-based index
        _addressIndices[msg.sender][wallet] = _userAddresses[msg.sender].length;

        emit AddressAdded(msg.sender, wallet, label, cat, timestamp);
    }

    /**
     * @notice Add a trusted address with label (defaults category to "Personal").
     * @param wallet The address to trust.
     * @param label The custom user-defined label.
     */
    function addTrustedAddress(address wallet, string memory label) external {
        addTrustedAddressWithCategory(wallet, label, "Personal");
    }

    /**
     * @notice Remove a trusted address from the caller's list using O(1) swap-and-pop.
     * @param wallet The address to remove.
     */
    function removeTrustedAddress(address wallet) external {
        uint256 index1Based = _addressIndices[msg.sender][wallet];
        if (index1Based == 0) revert AddressNotFound(wallet);

        uint256 indexToDelete = index1Based - 1;
        uint256 lastIndex = _userAddresses[msg.sender].length - 1;

        if (indexToDelete != lastIndex) {
            TrustedAddress memory lastItem = _userAddresses[msg.sender][lastIndex];
            _userAddresses[msg.sender][indexToDelete] = lastItem;
            _addressIndices[msg.sender][lastItem.wallet] = index1Based;
        }

        _userAddresses[msg.sender].pop();
        delete _addressIndices[msg.sender][wallet];

        emit AddressRemoved(msg.sender, wallet);
    }

    /**
     * @notice Update the label of an existing trusted address.
     * @param wallet The trusted address.
     * @param newLabel The updated label.
     */
    function updateLabel(address wallet, string memory newLabel) external {
        uint256 index1Based = _addressIndices[msg.sender][wallet];
        if (index1Based == 0) revert AddressNotFound(wallet);
        if (bytes(newLabel).length == 0) revert EmptyLabelNotAllowed();

        _userAddresses[msg.sender][index1Based - 1].label = newLabel;

        emit LabelUpdated(msg.sender, wallet, newLabel);
    }

    /**
     * @notice Update the category of an existing trusted address.
     * @param wallet The trusted address.
     * @param newCategory The updated category.
     */
    function updateCategory(address wallet, string memory newCategory) external {
        uint256 index1Based = _addressIndices[msg.sender][wallet];
        if (index1Based == 0) revert AddressNotFound(wallet);

        string memory cat = bytes(newCategory).length == 0 ? "Personal" : newCategory;
        _userAddresses[msg.sender][index1Based - 1].category = cat;

        emit CategoryUpdated(msg.sender, wallet, cat);
    }

    /**
     * @notice Check whether a given wallet address is trusted by a specific owner.
     * @param owner The address book owner.
     * @param wallet The address to verify.
     * @return bool True if trusted, false otherwise.
     */
    function isTrusted(address owner, address wallet) external view returns (bool) {
        return _addressIndices[owner][wallet] != 0;
    }

    /**
     * @notice Retrieve all trusted addresses saved by the caller.
     * @return TrustedAddress[] Array of saved trusted addresses.
     */
    function getMyTrustedAddresses() external view returns (TrustedAddress[] memory) {
        return _userAddresses[msg.sender];
    }

    /**
     * @notice Get total count of saved trusted addresses for caller.
     */
    function getMyTrustedCount() external view returns (uint256) {
        return _userAddresses[msg.sender].length;
    }
}
