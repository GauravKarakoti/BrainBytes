# Contributing to BrainBytes

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to BrainBytes. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/GauravKarakoti/BrainBytes.git
    cd BrainBytes
    ```
3.  **Install dependencies** (we use `pnpm`):
    ```bash
    pnpm install
    ```
4.  **Set up Environment Variables**:
    * Copy `.env.example` to `.env`.
    * Fill in the required credentials (Neon DB, Auth0, Pusher, etc.).
5.  **Database Setup**:
    ```bash
    pnpm db:push
    pnpm db:seed
    ```
6.  **Create a Branch**:
    ```bash
    git checkout -b feature/amazing-feature
    ```

## Development Workflow

* **Run the dev server**:
    ```bash
    pnpm dev
    ```
* **Database Changes**: If you modify the schema in `db/schema/`, generate a migration:
    ```bash
    pnpm db:gen
    ```
* **Linting**: Ensure your code follows the project's style:
    ```bash
    pnpm lint
    ```

## How to Contribute

### Reporting Bugs
This section guides you through submitting a bug report.
* **Check existing issues** to see if the bug has already been reported.
* **Open a new issue** using the "Bug Report" template.
* **Include details**: Steps to reproduce, expected behavior, and screenshots.

### Suggesting Enhancements
* **Open a new issue** using the "Feature Request" template.
* **Explain why** this enhancement would be useful to most BrainBytes users.

### Pull Requests
1.  Fill in the required template.
2.  Do not include issue numbers in the PR title.
3.  Include screenshots and animated GIFs in your pull request whenever possible.
4.  Follow the [TypeScript](https://www.typescriptlang.org/) and [Tailwind CSS](https://tailwindcss.com/) best practices used in the project.
5.  End all files with a newline.

## Tech Stack References
* [Next.js Documentation](https://nextjs.org/docs)
* [Drizzle ORM](https://orm.drizzle.team/)
* [Auth0](https://auth0.com/)
* [Tailwind CSS](https://tailwindcss.com/)

## License
By contributing, you agree that your contributions will be licensed under its MIT License.