import argparse
import logging
import os.path
import re
import shutil
import unittest
from tempfile import mkdtemp
from typing import Optional

import merger

FAKE_FILE_FIXTURE = """\
function fake() {
    return null;
}"""

log = logging.getLogger(__name__)


class TestMerger(unittest.TestCase):
    _unittest_dir: Optional[str] = None
    EXPECTED_FILE_TAGS = [
        "/** -> FILE: utils/example_deep_dependency.js **/",
        "/** -> FILE: utils/examples.js **/",
        "/** -> FILE: utils/simple_logger.js **/",
        "/** -> FILE: utils/clasp_run_wrapper.js **/",
        "/** -> FILE: code.js **/",
    ]

    @classmethod
    def setUpClass(cls) -> None:
        cls._unittest_dir = os.path.dirname(os.path.realpath(__file__))

    def setUp(self) -> None:
        merger.visited_files = set()
        if self._unittest_dir is None:
            raise ValueError("Test directory not set")
        os.chdir(self._unittest_dir)
        self.temp_dir = mkdtemp()
        shutil.copytree(
            "test_data", os.path.join(self.temp_dir, "data"), dirs_exist_ok=True
        )
        merger.args = argparse.Namespace(
            input=os.path.join(self.temp_dir, "data"),
            exclude=[],
        )
        os.chdir(self.temp_dir)

    def tearDown(self) -> None:
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def _create_fake_data_file(self, path):
        path = os.path.join(self.temp_dir, "data", path)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            f.write(FAKE_FILE_FIXTURE)

    def _log_dir(self):
        for root, dirs, files in os.walk(self.temp_dir):
            for dir in dirs:
                log.error("D: " + os.path.join(root, dir))
            for file in files:
                log.error("F: " + os.path.join(root, file))

    def assertFileExists(self, path):
        try:
            self.assertTrue(os.path.isfile(path), f"File {path} does not exist")
        except AssertionError as e:
            self._log_dir()
            raise e

    def assertCleanUp(self, path):
        with open(path) as f:
            content = f.read()
        if re.match(r"require\(.+\)", content, re.MULTILINE):
            raise AssertionError(f"File {path} contains require statements")
        if re.match(r"^import\s.+", content, re.MULTILINE):
            raise AssertionError(f"File {path} contains import statements")
        if re.match(r"^export\s.+", content, re.MULTILINE):
            raise AssertionError(f"File {path} contains export statements")

    def assertFileTags(self, path, expected_tags=None):
        if expected_tags is None:
            expected_tags = self.EXPECTED_FILE_TAGS
        with open(path) as f:
            content = f.read()

        match = re.findall(r"^\/\*\*\s->\sFILE:\s.+?\s\*\*\/$", content, re.MULTILINE)
        for i, tag in enumerate(expected_tags):
            self.assertTrue(
                i < len(match),
                f"File tags are missing or in wrong order: {tag} not found",
            )
            self.assertEqual(
                tag, match[i], f"File tags are missing or in wrong order: {tag}"
            )

    def test_dir_input_single_relative_output(self):
        merger.args.input = "data"
        merger.args.single_output = "outxxx"

        merger.main()
        self.assertTrue(os.path.isfile(os.path.join(self.temp_dir, "outxxx")))
        self.assertFileTags(os.path.join(self.temp_dir, "outxxx"))
        self.assertCleanUp(os.path.join(self.temp_dir, "outxxx"))

    def test_dir_input_single_output(self):
        output_path = os.path.join(self.temp_dir, "outyyy")
        merger.args.single_output = output_path

        merger.main()
        self.assertTrue(os.path.isfile(output_path))
        self.assertFileTags(output_path)
        self.assertCleanUp(output_path)

    def test_dir_input_extra_files(self):
        output_path = os.path.join(self.temp_dir, "outyyy")
        merger.args.single_output = output_path
        self._create_fake_data_file(os.path.join("utils", "aaa_fake.js"))

        merger.main()
        self.assertTrue(os.path.isfile(output_path))
        self.assertFileTags(
            output_path,
            self.EXPECTED_FILE_TAGS + ["/** -> FILE: utils/aaa_fake.js **/"],
        )
        self.assertCleanUp(output_path)

    def test_dir_input_multi_output(self):
        merger.args.multi_output = os.path.join(self.temp_dir, "multi_output")
        merger.args.single_output = None

        merger.main()
        self.assertTrue(os.path.isdir(os.path.join(self.temp_dir, "multi_output")))

        check_paths = [
            ["utils", "examples.js"],
            ["utils", "example_deep_dependency.js"],
            ["utils", "simple_logger.js"],
            ["utils", "clasp_run_wrapper.js"],
            ["code.js"],
        ]
        for path_components in check_paths:
            self.assertFileExists(
                os.path.join(self.temp_dir, "multi_output", *path_components)
            )
        for root, _, files in os.walk(os.path.join(self.temp_dir, "multi_data")):
            for fname in files:
                path = os.path.join(root, fname)
                self.assertCleanUp(path)

    def test_single_input_with_extra_files(self):
        output_path = os.path.join(self.temp_dir, "outzzz")
        merger.args.single_output = None
        merger.args.multi_output = output_path
        merger.args.input = os.path.join(self.temp_dir, "data", "code.js")
        self._create_fake_data_file(os.path.join("utils", "aaa_fake.js"))

        merger.main()
        self.assertTrue(os.path.isdir(output_path))
        # no direct import, no file in output
        self.assertFalse(os.path.isfile("utils/aaa_fake.js"))
        check_paths = [
            ["utils", "examples.js"],
            ["utils", "example_deep_dependency.js"],
            ["utils", "simple_logger.js"],
            ["utils", "clasp_run_wrapper.js"],
            ["code.js"],
        ]
        for path_components in check_paths:
            self.assertFileExists(
                os.path.join(self.temp_dir, "outzzz", *path_components)
            )

    def test_single_input_single_output(self):

        output_path = "zzzout"
        merger.args.single_output = output_path
        merger.args.multi_output = None
        merger.args.input = os.path.join("data", "code.js")

        merger.main()
        full_output_path = os.path.join(self.temp_dir, output_path)
        self.assertTrue(os.path.isfile(full_output_path))
        self.assertFileTags(full_output_path)
        self.assertCleanUp(full_output_path)

    def test_trailing_slash(self):
        output_path = "abc123"
        merger.args.single_output = output_path
        merger.args.input = "data/"
        merger.main()

        full_output_path = os.path.join(self.temp_dir, output_path)

        self.assertTrue(os.path.isfile(full_output_path))
        self.assertFileTags(full_output_path)
        self.assertCleanUp(full_output_path)


if __name__ == "__main__":
    # logging.basicConfig(level=logging.DEBUG)
    unittest.main()
