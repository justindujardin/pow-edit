pow-edit tests
---

A suite of tests for pow-edit.  Strive for 95% branch coverage.

## Structure

File folders mirror the hierarchy in the `source/` path, with some additions that are unique to the test hierarchy.

### test/fixtures

The code and data fixtures that are needed by the test suite are located here.  

 - When referencing a data file fixture prepend `base` to the path, e.g. `base/test/fixtures/syntaxOkayMap.tmx`.
 - When referencing a code fixture reference relative to the test file, e.g. `///<reference path="../../fixtures/tileEditorFixture.ts"/>`
  