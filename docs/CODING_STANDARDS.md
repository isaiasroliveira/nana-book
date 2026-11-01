# Coding standards

Use judgment: assess the benefit and cost of a rule in its context rather than applying it mechanically.

## Design and responsibilities

- Prefer readable, simple, correct and maintainable solutions. Follow existing conventions where appropriate.
- Write identifiers, code comments and documentation in English. Reader-facing text may be in Portuguese.
- Keep functions and modules cohesive. Prefer pure functions where appropriate and make side effects explicit.
- Share duplicated logic when a clear, useful abstraction exists. Avoid speculative layers, dependencies, configuration and generalization.
- Preserve compatibility and behavior during refactoring unless a change is intentional. Keep changes within scope.

## Boundaries and data

- Validate external input and enforce authentication and authorization for protected operations on the server.
- Handle errors explicitly and retain useful diagnostic context. Do not log secrets or unnecessary personal data.
- Consider security, performance, reliability and observability according to risk. Use transactions for operations that must be atomic.

## Testing and review

- Test meaningful behavior, edge cases and regressions without coupling tests to implementation details. Match test depth to risk.
- Run relevant available checks and report failures and checks not run.
- Prefer cohesive, independently understandable and verifiable changes and pull requests. Automate repetitive checks when the toolchain is established.
- Record significant architectural decisions with context, alternatives and consequences. Update documentation when behavior or decisions change.

## References

- [Google code review standard](https://google.github.io/eng-practices/review/reviewer/standard.html)
- [Microsoft architecture decision records](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record)
