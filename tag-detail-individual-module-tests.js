// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by tag-detail-individual-module.js.
import { name as packageName } from "meteor/tag-detail-individual-module";

// Write your tests here!
// Here is an example.
Tinytest.add('tag-detail-individual-module - example', function (test) {
  test.equal(packageName, "tag-detail-individual-module");
});
