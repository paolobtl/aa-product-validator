# Adobe Analytics Product String Validator

## Overview
The Adobe Analytics Product String Validator is a tool designed to validate and parse the `s.products` string used in Adobe Analytics implementations. It ensures that the product string adheres to the correct syntax as outlined in the [Adobe Analytics documentation](https://experienceleague.adobe.com/en/docs/analytics/implementation/vars/page-vars/products). The tool parses the stringreactive string, breaking it down into individual product components to make it easier to read and verify the properties of each product.

## Features
- Validates the syntax of Adobe Analytics product strings.
- Parses and displays each product's fields (category, name, quantity, price, events, and eVars) in a readable format.
- Supports multiple products separated by commas.
- Highlights errors in the product string format.

## Usage
1. Visit the [Adobe Analytics Product String Validator webpage](https://paolobtl.github.io/aa-product-validator/).
2. Enter your `s.products` string into the input field.
3. Submit the string to see the parsed results, with each product's fields clearly displayed.
4. Check for any error messages indicating issues with the string's syntax.

## Example
For a product string like:
```
"Example category;Example product;1;3.50;event1=4.99|eVar1=Value1,Another category;Another product;2;5.99"
```
The validator will parse it into:
- Product 1: 
  - Category: Example category
  - Name: Example product
  - Quantity: 1
  - Price: 3.50
  - Events: event1=4.99
  - eVars: eVar1=Value1
- Product 2:
  - Category: Another category
  - Name: Another product
  - Quantity: 2
  - Price: 5.99

## Installation
Pre Requisites:
- [Node.js](https://nodejs.org/en)
- [NPM]([url](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))

To run the validator locally:
1. Clone the repository:
   ```bash
   git clone https://github.com/paolobtl/aa-product-validator.git
   ```
2. Type `npm run preview` in your terminal.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue to discuss any changes or improvements.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](https://github.com/paolobtl/aa-product-validator/blob/main/LICENSE) file for details.

## Contact
For questions or feedback, please open an issue on the [GitHub repository](https://github.com/paolobtl/aa-product-validator/issues/new/choose).
