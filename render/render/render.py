import argparse
import os
import shutil
import subprocess
from typing import Any, Dict, List, Union

import jinja2

BASE_DIR = "base"
FONT_DIR = "fonts"
REQUIRED_PROGRAMS = ["inkscape"]


def is_tool(name: str) -> Union[str, bool]:
    """Check whether `name` is on PATH and marked as executable."""
    return shutil.which(name) is not None


def checks() -> None:
    # Make sure the appropriate programs are installed
    for program in REQUIRED_PROGRAMS:
        if not is_tool(program):
            raise Exception(f"Program {program} is not installed")


def run_subprocess(commandline_args: str) -> None:
    print("::SUBPROCESS COMMANDLINE ARGS: ", commandline_args)
    out = subprocess.Popen(  # noqa
        commandline_args,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=True,
    )
    (stdout_data, stderr_data) = out.communicate()
    print("::SUBPROCESS STDOUT          : ")
    for string in stdout_data.decode("utf-8").split("\n"):
        print(string)
    print("::SUBPROCESS STDERR          : ")
    for string in str(stderr_data).split("\n"):
        print(string)
    # Check the returncode to see whether the process terminated normally
    if out.returncode == 0:
        print(
            f"INFO: Subprocess exited normally with return code: "
            + f"{out.returncode}"
        )
    else:
        print(
            f"INFO: Subprocess exited with non-zero return code: "
            + f"{out.returncode}"
        )
        raise SystemExit


def convert_svg_to_pdf(directory: str) -> None:
    # Make sure the appropriate programs are installed
    checks()
    # Collect all svg files that need to be converted
    svg_files = [
        [file, file.split(".")[0]]
        for file in os.listdir(directory)
        if file.split(".")[-1] == "svg"
    ]
    for svg_file, name in svg_files:
        commandline_args = (
            f"inkscape {os.path.join(directory, svg_file)} "
            + f"--batch-process "
            + f"--export-type=pdf "
            f"--export-filename={os.path.join(directory, f'{name}.pdf')}"
        )
        run_subprocess(commandline_args=commandline_args)
        print("Executing: ", commandline_args)


class PosterRenderer:
    """
    A simple class for rendering a set of pre-specified jinja templates \
    (located in the ./base directory) to a set of TikZ illustrations.

    The TikZ illustrations are compiled into a final "main.tex" file that can \
    be compiled with LaTeX into a pdf document.
    """

    def __init__(self, args: Union[Dict[Any, Any], argparse.Namespace]) -> None:
        if isinstance(args, Dict):
            self.args = args
        elif isinstance(args, argparse.Namespace):
            self.args = dict(args.__dict__)
        else:
            raise ValueError("Given input argument 'args' has the wrong type!")
        self._check_vars()

    def render(
        self,
        template_dir: str = BASE_DIR,
        output_dir: str = "output",
        file_prefix: str = "",
    ) -> None:
        """Render all jinja templates, i.e., generate TikZ illustrations and
        compile these into a final "main.tex" documents loacted in the
        "output_dir"."""
        # Load jinja templates
        jinja_templates = self.load_jinja_templates(template_dir)
        # Create directories for generated output
        self.create_directories(output_dir)
        # Move the appropriate files to the created directories
        self.move_files(output_dir)
        # Render all templates
        self.render_templates(
            jinja_templates=jinja_templates,
            output_dir=output_dir,
            prefix=file_prefix,
        )

    def load_jinja_templates(
        self, template_dir: str
    ) -> jinja2.environment.Environment:
        """Load the directory that contains the jinja templates."""
        try:
            jinja_templates = jinja2.Environment(
                autoescape=False,
                loader=jinja2.FileSystemLoader(
                    searchpath=os.path.join(template_dir),
                ),
            )
        except KeyError as e:
            raise ValueError(f'Variable "template_dir" not defined!\n {e}')
        return jinja_templates

    def render_templates(
        self,
        jinja_templates: jinja2.environment.Environment,
        output_dir: str,
        prefix: str,
    ) -> None:
        # Create an figure grid
        file_name = "figures.tex"
        output_file = os.path.join(output_dir, file_name)
        # Compute additional quantities that need to be passed into the
        # 'figures.tex.jinja' template
        template_vars = self._set_figures_template_vars(output_dir=output_dir)
        self.render_template(
            jinja_templates=jinja_templates,
            template_vars=template_vars,
            # The template file to use. Should not be changed:
            template_name="figures.tex.jinja",
            # Specify the correct directory to place the generated file in:
            outfile=output_file,
        )
        # Create main ".tex" document
        output_file = os.path.join(output_dir, "main.tex")
        # Compute additional quantities that need to be passed into the
        # 'main.tex.jinja' template
        template_vars = self._set_main_template_vars()
        self.render_template(
            jinja_templates=jinja_templates,
            template_vars=template_vars,
            # The template file to use. Should not be changed:
            template_name="main.tex.jinja",
            # Specify the correct directory to place the generated file in:
            outfile=output_file,
        )

    def render_template(
        self,
        jinja_templates: jinja2.environment.Environment,
        template_vars: Dict[Any, Any],
        template_name: str,
        outfile: str,
    ) -> None:
        # Generate configuration and other files according to the given
        # templates
        template = jinja_templates.select_template([template_name])
        with open(outfile, "w") as file:
            print(template.render(**template_vars), file=file)

    def move_files(self, output_dir: str) -> None:
        self._move_font_files(output_dir)
        self._move_svg_files(output_dir)

    def create_directories(self, output_dir: str) -> None:
        """Create directories."""
        # Create required output directories if they're missing
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)

    def _check_vars(self):
        pass

    def _set_main_template_vars(self) -> Dict[Any, Any]:
        template_vars = {}
        template_vars.update(self.args)
        template_vars["left"] = 1 * float(self.args["widthMargin"]) / 2.0
        template_vars["right"] = 1 * float(self.args["widthMargin"]) / 2.0
        template_vars["top"] = 1 * float(self.args["heightMargin"]) / 3.0
        template_vars["bottom"] = 2 * float(self.args["heightMargin"]) / 3.0
        return template_vars

    def _set_figures_template_vars(self, output_dir: str) -> Dict[Any, Any]:
        template_vars = {}
        template_vars.update(self.args)
        template_vars["textWidthScalar"] = 1 / self.args["columns"]
        template_vars["files"] = self._organize_files(output_dir=output_dir)
        return template_vars

    def _organize_files(self, output_dir: str) -> List[List[str]]:
        _output_dir = os.path.join(
            output_dir, os.path.basename(self.args["input"])
        )
        files = os.listdir(_output_dir)
        files = [
            os.path.join(os.path.basename(self.args["input"]), _)
            for _ in sorted(files, key=lambda x: x.split("_")[-1])
        ]
        counter = 0
        rows = []
        for _ in range(self.args["rows"]):
            columns = []
            for _ in range(self.args["columns"]):
                columns.append(files[counter])
                counter += 1
            rows.append(columns)
        return rows

    def _move_font_files(self, output_dir: str) -> None:
        files = os.listdir(os.path.join(BASE_DIR, FONT_DIR))
        for src in files:
            shutil.copytree(
                src=os.path.join(BASE_DIR, FONT_DIR, src),  # noqa
                dst=os.path.join(output_dir, FONT_DIR, src),  # noqa
                dirs_exist_ok=True,
            )

    def _move_svg_files(self, output_dir: str) -> None:
        _output_dir = os.path.join(
            output_dir, os.path.basename(self.args["input"])
        )
        shutil.copytree(
            src=self.args["input"], dst=_output_dir, dirs_exist_ok=True,
        )
        # TODO: Move to another method
        # Convert the svg files that were moved to the new directory
        convert_svg_to_pdf(directory=_output_dir)
        # Clean up the directory by deleting the svg files that are no
        # longer needed
        svg_files = [
            os.path.join(_output_dir, svg_file)
            for svg_file in os.listdir(_output_dir)
            if svg_file.split(".")[-1] == "svg"
        ]
        for svg_file in svg_files:
            os.remove(svg_file)
