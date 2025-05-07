import tex2svg from 'node-tikzjax';
import path from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'fs';
import { parse } from 'node-html-parser';
import { Buffer } from "node:buffer";
import minifyHtml from "@minify-html/node";
import { transform } from 'lightningcss';
import minifyJs from "@minify-js/node";
import ignore from 'ignore';
import dir from 'node-dir';
import { parseArgs } from 'node:util';

const args = process.argv.slice(2);
const options = {
    verbose: {
        type: 'boolean',
        short: 'v',
    },
    bar: {
        type: 'string',
    },
};
const {
    values,
    positionals,
} = parseArgs({ args, options, allowPositionals: true });

const __dirname = import.meta.dirname;
const showConsole = values.verbose || false;

async function convertTikz(tikz) {
    tikz = "\\begin{document}" + tikz + "\\end{document}";
    const svg = await tex2svg.default(tikz, {
        showConsole,
        texPackages: { pgfplots: '', amsmath: 'intlimits' },
        tikzLibraries: 'arrows.meta,calc,positioning',
        addToPreamble: '\\pgfplotsset{compat=1.16}'
    });
    return svg;
}

async function processHtmlFile(filePath) {
    console.log(`Processing ${filePath}`);

    const srcRelativePath = path.relative(__dirname, filePath);
    const outputPath = path.join(__dirname, 'build', srcRelativePath);

    if (!existsSync(path.dirname(outputPath))) {
        mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    const text = readFileSync(filePath);
    const html = parse(text);

    const tikzElements = html.querySelectorAll("script[type=text/tikz]");
    for (let elem of tikzElements) {
        const svg = await convertTikz(elem.innerHTML);
        const svgElement = parse(svg).firstChild;
        elem.tagName = "svg";
        elem.innerHTML = svgElement.innerHTML;
        elem.setAttribute("xmlns", svgElement.getAttribute("xmlns"));
        elem.setAttribute("width", svgElement.getAttribute("width"));
        elem.setAttribute("height", svgElement.getAttribute("height"));
        elem.setAttribute("viewBox", svgElement.getAttribute("viewBox"));
    }

    const outputStr = html.toString();

    let minified;
    try {
        minified = minifyHtml.minify(Buffer.from(outputStr), {
            minify_css: true,
            minify_js: true,
            keep_input_type_text_attr: true
        }).toString('utf8');
    } catch {
        minified = minifyHtml.minify(Buffer.from(outputStr), {
            minify_css: true,
            minify_js: false,
            keep_input_type_text_attr: true
        }).toString('utf8');
    }

    writeFileSync(outputPath, minified);
}

const buildignoreFile = path.join(__dirname, '.buildignore');
const buildignore = existsSync(buildignoreFile) ? readFileSync(buildignoreFile, 'utf8').split('\n') : [];
const noProcessFile = path.join(__dirname, '.noprocess');
const noProcess = existsSync(noProcessFile) ? readFileSync(noProcessFile, 'utf8').split('\n') : [];

const ig_buildignore = ignore().add(buildignore);
const ig_noprocess = ignore().add(noProcess);

const filesRaw = await dir.promiseFiles(__dirname);
const files = filesRaw.map(p => path.relative(__dirname, p)).filter(ig_buildignore.createFilter());

function printUsage() {
    console.log("Usage: node build.js [clean,build] [-v,--verbose]");
    console.log("Options:");
    console.log("  -v, --verbose   Show verbose output");
    console.log("Commands:");
    console.log("  clean           Clean the build directory");
    console.log("  build           Build the project");
}

if (positionals.length == 0) {
    printUsage();
} else {
    switch (positionals[0]) {
        case "clean":
            console.log("Cleaning build directory");
            if (existsSync(path.join(__dirname, 'build'))) {
                rmSync(path.join(__dirname, 'build'), { recursive: true, force: true });
            } else {
                console.log("Build directory does not exist");
                break;
            }
            console.log("Build directory cleaned");
            break;
        case "build":
            console.log("Building project");
            for (const file of files) {
                if (file.endsWith('.css') && !ig_noprocess.ignores(file)) {
                    console.log(`Transforming ${file} stylesheet`);
                    const cssSource = readFileSync(file, 'utf8');

                    let { code, map } = transform({
                        filename: file,
                        code: Buffer.from(cssSource),
                        minify: true,
                        sourceMap: true
                    });

                    const cssOutputPath = path.join(__dirname, 'build', file);
                    if (!existsSync(path.dirname(cssOutputPath))) {
                        mkdirSync(path.dirname(cssOutputPath), { recursive: true });
                    }
                    writeFileSync(cssOutputPath, code.toString('utf8'));
                    const cssMapOutputPath = path.join(__dirname, 'build', file + '.map');
                    writeFileSync(cssMapOutputPath, map.toString('utf8'));
                } else if (file.endsWith('.js') && !ig_noprocess.ignores(file)) {
                    console.log(`Transforming ${file} script`);
                    const jsSource = readFileSync(file, 'utf8');
                    const jsOutputPath = path.join(__dirname, 'build', file);
                    if (!existsSync(path.dirname(jsOutputPath))) {
                        mkdirSync(path.dirname(jsOutputPath), { recursive: true });
                    }

                    let minified = jsSource;
                    try {
                        minified = minifyJs.minify("global", Buffer.from(jsSource)).toString('utf8');
                    } catch { }

                    writeFileSync(jsOutputPath, minified);
                }
                else if (file.endsWith('.html') && !ig_noprocess.ignores(file)) {
                    await processHtmlFile(file, !ig_noprocess.ignores(file));
                } else {
                    console.log(`Copying ${file} to build directory`);
                    const filePath = path.dirname(file);

                    if (!existsSync(path.join(__dirname, 'build', filePath))) {
                        mkdirSync(path.join(__dirname, 'build', filePath), { recursive: true });
                    }

                    copyFileSync(file, path.join(__dirname, 'build', file));
                }
            }
            console.log("Build complete");
            break;
        default:
            console.log("Unknown command");
            printUsage();
            break;
    }
}