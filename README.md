# funny-math
A website that generates random math equations with random numbers using the LaTeX formatting & Jimp for image manipulation.

## Building
### Prerequisites
- Node.js package manager
  - [pnpm](https://pnpm.js.org/en/installation) (recommended)
  - [npm](https://www.npmjs.com/get-npm)
  - [yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable)

1. Clone the repository
```bash
git clone https://github.com/metamethods/funny-math.git
```
2. Install dependencies
3. Build the project
4. Profit (The build will be in the `dist` folder)

## Contributing
### Adding a expression
1. Create a new file in `./expressions` directory with the name of your expression set i.e. `pemdas.toml`
2. Add the information to the file in the following format:
```toml
[information]
name = # Name of the expression set
description = # Description of this expression set
author = # Your name
title = # The Actual title that is display when generating a new expression
```
3. Add the expressions to the file in the following format:
```toml
[[expressions]]
expression = # The expression in LaTeX format
todo = # What the answer is supposed to be expressed as (NOT REQUIRED)
```
4. Create a pull request with your changes, and I'll happily merge it in! (if its good enough)

### Other Contributions
All contributions are welcome, just create a pull request with your changes, and I'll review it as soon as I can!