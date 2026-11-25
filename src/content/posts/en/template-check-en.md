---
title: "Template check: English original"
slug: template-check-en
description: "A sample written in English first, with no Korean version. It checks that an English original gets no language switch link and no hreflang. It is never deployed."
category: etc
tags: [sample]
status: draft
lang: en
ai_assisted: true
audience: "The site owner checking the blog template"
search_intent: "Not applicable (a check-only post that is never deployed)"
created_at: 2026-11-25
reviewed_at:
reviewed_by:
review_notes:
published_at:
updated_at:
disclosure:
---

This sample is an English original. It has no `translated_from` field and no Korean version, so its page should show no language switch link in the header and no `hreflang` links in the head. It only appears on the English site (`/en/`), never on the Korean one.

Like the other template check samples, it stays `status: draft`. scripts/check-content.ts fails the build if any file whose name starts with `template-check` is not a draft.
