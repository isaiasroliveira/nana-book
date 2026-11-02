# MVP launch readiness

Status: scope, ticket breakdown and public test boundaries approved on 2026-11-02. Production SMTP remains an open configuration decision.

## Problem

Readers can maintain a private diary, but a forgotten password or an unwanted evaluation has no self-service remedy. A public launch also requires a working production environment, a clear account-data policy and evidence that the diary can be recovered and operated.

## Proposed outcome

Readers can recover access, delete their own evaluations and request deletion of their account and associated evaluations. They can find a privacy notice that accurately describes the deployed service. Operators can deploy, monitor and restore the service and validate the core journey with real integrations before launch.

## Proposed vertical tickets

1. **Recover account access**. Blocked by: none. Request a password reset by email and set a new password through an expiring reset link. Avoid revealing whether an account exists. Verify delivery in an isolated environment and configure custom SMTP before production.
2. **Delete a private evaluation**. Blocked by: none. Confirm deletion from the diary, delete only the authenticated reader's selected evaluation, and refresh the diary and featured reading. Preserve the evaluation and offer retry on failure.
3. **Delete an account and its diary**. Blocked by: none. Provide an explicit confirmation and any authentication required by the identity provider; remove the account and associated evaluations, end the session and explain the outcome. Define backup retention and any limitations accurately before release.
4. **Publish an accurate privacy notice**. Blocked by: production service and retention decisions. Describe the data collected, purposes, service providers, retention, deletion and the support contact, irodri.tech@gmail.com. Link it from account creation and the application. Review the final text against the actual deployment before publication.
5. **Prepare and verify production operations**. Blocked by: domain, operator and service configuration decisions. Use Vercel for hosting and document and verify deployment, secrets, migrations, trusted origins, email, backups and restoration, error and availability monitoring, catalog quotas and incident ownership. Keep credentials out of the repository.
6. **Validate the launch journey**. Blocked by: tickets 1–5. Exercise registration, recovery, search, saving, editing and deletion with real services in the intended environment, including mobile and desktop, representative Brazilian books and catalog failure. Record results and resolve launch-blocking failures.

## Public test boundaries

- Exercise password recovery through the reader-facing flow and the authentication provider's supported boundary; cover invalid or expired links and non-disclosing responses. Verify actual email delivery in the target environment.
- Exercise evaluation deletion through the diary and authenticated HTTP boundary against an isolated database. Verify ownership, confirmation, persistence after reload and failure recovery.
- Exercise account deletion through the reader-facing flow and an isolated identity and database environment. Verify associated evaluations disappear and another reader's data remains intact.
- Check the privacy notice and its links against actual service and retention decisions; automated tests cannot establish legal sufficiency.
- Verify deployment and monitoring with a real target environment. Restore an isolated backup and confirm that the core journey works; do not use production credentials in tests.
- For each implementation slice, demonstrate a failing public behavior test before implementation. Existing deterministic fixtures do not prove live catalog coverage or production email delivery.

## Out of scope

Reading statuses, rereading history, sharing, social features, catalog provider changes and data export. This proposal does not authorize a production deployment or destructive operations on existing user data.

## Open decisions

- Domain, Vercel plan, production accounts and incident owner.
- Authentication email delivery and sender configuration: Neon provides shared SMTP for getting started, but its production guidance requires custom SMTP. Choose and verify a production sender.
- Backup retention, restoration objectives and deletion treatment in backups.
- Final privacy notice review.
- Whether account deletion is self-service or handled through a documented request when provider capabilities or operational constraints prevent safe self-service.

## Proposed amendment: password policy and signup verification

Status: scope, ticket breakdown and public test boundaries approved on 2026-11-02.

- Require at least 12 characters, including a digit, an uppercase letter, a lowercase letter and a special character, when creating or resetting a password. Display each requirement and whether it is satisfied. Existing passwords remain valid for sign-in.
- Enforce the same policy at the server-side authentication boundary, and investigate whether the independently accessible managed Auth endpoint can enforce it too. Do not claim universal enforcement if the provider cannot apply it.
- Investigate why signup did not produce a verification email. Check the branch setting and supported verification flow; offer a complete, usable confirmation flow if verification is enabled, including resend and failure feedback. The shared sender supports verification codes; links require custom SMTP according to Neon guidance.
- The user reports receiving a password recovery email; completing the reset and validating invalid or expired links remain unverified.
- Production Neon Auth was inspected on 2026-11-02: email verification is required, the method is OTP, and automatic messages on sign-up and sign-in are disabled. The application requests a verification code explicitly; delivery and successful confirmation with a real inbox remain to be verified.

### Proposed tickets and public test boundaries

1. **Enforce and explain password requirements**. Blocked by: none. Exercise signup and reset forms with passing and failing examples, including visible requirement states; exercise the server boundary directly with invalid and valid passwords and verify existing sign-in remains compatible. Test provider enforcement separately where available.
2. **Confirm account email**. Blocked by: investigation of the branch verification setting and delivery mechanism. Test signup, confirmation, resend, expired or invalid codes and failure states through the reader-facing interface and an isolated Neon Auth branch. Verify actual delivery to a test inbox.

Tracking: [password policy #35](https://github.com/isaiasroliveira/nana-books/issues/35) and [account confirmation #36](https://github.com/isaiasroliveira/nana-books/issues/36).

## Tracking

- [Recover account access](https://github.com/isaiasroliveira/nana-books/issues/29)
- [Delete a private evaluation](https://github.com/isaiasroliveira/nana-books/issues/30)
- [Delete an account and its diary](https://github.com/isaiasroliveira/nana-books/issues/31)
- [Publish a privacy notice](https://github.com/isaiasroliveira/nana-books/issues/32)
- [Prepare production operations](https://github.com/isaiasroliveira/nana-books/issues/33)
- [Validate the MVP launch journey](https://github.com/isaiasroliveira/nana-books/issues/34)
