# Generative Art Sketches

This repo contains generative art sketches produced for the purpose of plotting them with the [AxiDraw](https://www.axidraw.com/) penplotter.

The repo essentially contains documentation and the code that was used to produce each of the different art sketches.

## Technologies

The generative art sketches primarily utilize the tools:

- Typescript using libraries [two.js](https://two.js.org/) for rendering svg paths and [dat.gui](https://github.com/dataarts/dat.gui) for controlling possible input parameter settings.
- [Inkscape](https://inkscape.org/) for converting svg files into pdf files.
- Python for automation, organization and templating purposes using libraries such as [Jinja](https://jinja.palletsprojects.com).
- [xelatex](https://en.wikipedia.org/wiki/XeTeX) for final styling and for compiling converted pdf files into a single printable document.

## Sketch Processing Pipeline/Workflow

Run a sketch:

```bash
cd sketches/sketch001 && npm install && npm run start
```

Play around with the settings and download the generated `.svg` files.
Take note of the `widthMargin, heightMargin, columns, rows` settings as these will be necessary later.

Rename the desired (downloaded) files according to the naming convention `PRFIX_NUMBER.svg`, for example the files should be named according to the following pattern `svg_1.svg, svg_2.svg, svg_3.svg`, etc.

Move the renamed files to an input directory `input1` for further processing. Process the files in the input directory `input1` by running the python script in the `render` directory:

```bash
python main.py --output ../sketches/sketch001/output1 --input ../sketches/sketch001/input1 --widthMargin 20 --heightMargin 30 --columns 1 --rows 3
```

The commandline arguments `widthMargin, heightMargin, columns, rows` should align with whatever is given as input when playing around with the settings in the web interface.

Finally enter into the `sketches/sketch001/output1` directory. Make any necessary adjustments to the `main.tex` and compile the sketch:

```bash
xelatex main.tex
```

## Sketch Template

Some boilerplace code to get started can be found in the directory: `sketches/template/`.

## PDF to PNG

For inclusion in the documentation pdf files can be converted to pngs using inkscape and the following command:

```
convert -verbose -density 300 output1.pdf -sharpen 0x0.1 -colorspace RGB output1.png
```
