import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { Parser } from "../parser.ts";

const parser = new Parser();

const TestMetadata = () => {
  const metaTag =
    '<meta name="name" description="description" date="10-1-2020"/>';
  const expected: string[] = ["name", "description", "10-1-2020"];
  // @ts-ignore: testing private function
  const result = parser.getValueFromMetadata(metaTag);

  for (let i = 0; i < expected.length; i++) {
    assertEquals(result[i], expected[i]);
  }
};

const TestWrongInput = () => {
  const metaTag = "<meta name=>";
  const expected: string[] = [];

  // @ts-ignore: testing private function
  // This should probably throw an error?
  const result = parser.getValueFromMetadata(metaTag);
  assertEquals(result, expected);
};

Deno.test({
  name: "Metadata parsing",
  fn: TestMetadata,
});

Deno.test({
  name: "Wrong metadata input",
  fn: TestWrongInput,
});
