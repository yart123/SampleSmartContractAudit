### Migration of the contract to Solidity 0.8.18
- Adjusting compiler version to modern 0.8.18, recommended by Slither
- Constructors now need to be called `constructor` instead of the contract name, and constructor doesn't need a visibility
    - Changing `function StorageVictim() public {` to `constructor() {`
- Memory type now needs to be expressly set for local variables
    - Changing `Storage str;` to `Storage memory str;`, constructing object in memory before storing on the blockchain
    - Similarly changing `Storage str = storages[msg.sender];` to `Storage storage str = storages[msg.sender];` - no need to allocate memory for object we're just reading from
- Formatting the contract a bit, by adding/removing empty lines

### Slither Report
Running `slither` on the contract yielded no critical vulnerabilities but a few suggestions:
- `SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing "SPDX-License-Identifier: <SPDX-License>" to each source file. Use "SPDX-License-Identifier: UNLICENSED" for non-open-source code. Please see https://spdx.org for more information.`
    - __Recommendation:__ This will not impact your code performance, but definitely good to clearly state the license for you code
- `StorageVictim.store(uint256).str (contracts/UpdatedContract.sol#21) is a local variable never initialized
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#uninitialized-local-variables`
    - __Recommendation:__ This suggestion is not correct, as the variable is filled with values and used. However, it is not too gas-efficient to create an object first and then copy it to the blockchain. It would be more effective and readable this way:
    ```
        Storage storage str = storages[msg.sender];
        str.user = msg.sender;
        str.amount = _amount;
    ```
- `Parameter StorageVictim.store(uint256)._amount (contracts/UpdatedContract.sol#19) is not in mixedCase
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#conformance-to-solidity-naming-conventions`
    - __Recommendation:__ Slither didn't diagnose the issue too well. The real issue here is that a public function is using undescore prefix for a variable name, which is a suggested convention for private parameters according to [Solidity docs](https://docs.soliditylang.org/en/v0.8.19/style-guide.html#underscore-prefix-for-non-external-functions-and-variables). This won't affect your code either way.

### Manual Audit
-  Property `owner` is private, but we are exposing it with a getter function
    - __Recommendation:__ Just make it public and get rid of the getter function
- `Storage` struct stores the user address in it, despite user address being the key in the mapping
    - __Recommendation:__ No need to store `user` in `Storage`, just remove it
- Data in `storages` is private, and only exposed to the owner in a getter function.
    - __Recommendation:__ If the intention is to keep the data secret, this is not truly effective, as data can be reconstructed from the call history on the blockchain. If the data is inteded to be public, we should just make `storages` mapping public and remove the getter function.
- Function `getStore` returns a tuple.
    - __Recommendation:__ It would be better to return a `Storage` struct instead of a tuple, as it would be easier for users to use the function - accessing data with `retrievedStorage.amount` instead of `retrievedStorage[1]`.