import argparse
from typing import List, Union

from render.render import PosterRenderer


def print_verbose(string: str, verbose: bool) -> None:
    """
    Just a wrapper method for the print function.

    Args:
        s (str) : A string to print to std output.
        v (bool): A boolean value that decides whether the string
            is printed or not.
    Returns:
        None
    """
    if verbose:
        print(string)


class CommandLineArgs:
    """
    class: CommandLineArgs. A simple class that uses the "argparse" library \
    from the python standard library. The class simply wraps a number of \
    functions to make it easy to add optional and required commandline \
    arguments.
    """

    def __init__(self, args_list: Union[None, List] = None) -> None:
        self.args = self.get_commandline_args(args_list)

    def get_commandline_args(
        self, args_list: Union[None, List] = None,
    ) -> argparse.Namespace:
        """Setup, parse and validate given commandline arguments."""
        # Create main parser
        parser = argparse.ArgumentParser(description="")
        self.add_parser_arguments(parser)
        # Parse commandline arguments
        args = parser.parse_args(args_list)
        # Check the given commandline arguments
        self.check_args(args)
        return args

    def add_required_parser_arguments(
        self, parser: argparse.ArgumentParser,
    ) -> None:
        parser.add_argument(
            "--output",
            required=True,
            default="output",
            type=str,
            help="Specify a path to an OUTPUT directory.",
        )
        parser.add_argument(
            "--input",
            required=True,
            type=str,
            help="Specify a path to an INPUT directory containing .svg "
            + "files",
        )
        parser.add_argument("--rows", required=True, type=int, help="Specify")
        parser.add_argument(
            "--columns",
            required=True,
            type=int,
            help="Specify how many rows the .svg images should be arranged in.",
        )

    def add_optional_parser_arguments(
        self, parser: argparse.ArgumentParser,
    ) -> None:
        parser.add_argument(
            "--widthMargin",
            required=False,
            default=20,
            type=float,
            help="Specify the total WIDTH MARGIN of the document to generate.",
        )
        parser.add_argument(
            "--heightMargin",
            required=False,
            default=30,
            type=float,
            help="Specify the total HEIGHT MARGIN of the document to generate.",
        )
        parser.add_argument(
            "--lfooter",
            required=False,
            default="Nicklas Sindlev Andersen \\\\ \\today",
            type=str,
            help="Specify LEFT FOOTER content.",
        )
        parser.add_argument(
            "--rfooter",
            required=False,
            default="\\#001",
            type=str,
            help="Specify RIGHT FOOTER content.",
        )

    def add_parser_arguments(self, parser: argparse.ArgumentParser) -> None:
        """
        This function defines the possible commandline arguments for the main
        parser.

        Args:
            parser (argparse.ArgumentParser): A parser object, where required \
                and optional commandline arguments can be defined. Eventually, \
                when the python program is run, it will be possible to provide \
                input for the commandline arguments defined below.
        Returns:
            None
        """
        # Add required commandline arguments:
        self.add_required_parser_arguments(parser)
        # Add optional commandline arguments:
        self.add_optional_parser_arguments(parser)

    def check_required_arguments(self, args: argparse.Namespace) -> None:
        pass

    def check_optional_arguments(self, args: argparse.Namespace) -> None:
        pass

    def check_args(self, args: argparse.Namespace) -> argparse.Namespace:
        """
        This function validates a subset of the given commandline arguments.

        Args:
            args (argparse.Namespace): An object which contains all the given \
                input values of the previously defined commandline arguments \
                (these commandline arguments are defined in the \
                add_parser_arguments() function).

        Returns:
            None
        """
        print_verbose("INFO : Checking commandline arguments...", True)
        self.check_required_arguments(args=args)
        self.check_optional_arguments(args=args)
        return args


def main():
    """Main script entrypoint."""
    # Parse commandline arguments
    cmdargs = CommandLineArgs()
    # Generate the appropriate files for generating a poster displaying
    # a grid of .svg files
    poster_renderer = PosterRenderer(args=cmdargs.args)
    poster_renderer.render(
        template_dir="base", output_dir=cmdargs.args.output, file_prefix="",
    )


if "__main__" == __name__:
    main()
