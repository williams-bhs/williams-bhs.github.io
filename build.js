import tex2svg from 'node-tikzjax';
import path from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'fs';
import { parse } from 'node-html-parser';
import { Buffer } from "node:buffer";
import minifyHtml from "@minify-html/node";
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
    for (let elem of html.querySelectorAll("script[type=text/tikz]")) {
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
    const minified = minifyHtml.minify(Buffer.from(outputStr), {}).toString('utf8');

    writeFileSync(outputPath, minified);
}

const buildignoreFile = path.join(__dirname, '.buildignore');
const buildignore = existsSync(buildignoreFile) ? readFileSync(buildignoreFile, 'utf8').split('\n') : [];
const ig = ignore().add(buildignore);

const filesRaw = await dir.promiseFiles(__dirname);
const files = filesRaw.map(p => path.relative(__dirname, p)).filter(ig.createFilter());

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
                if (!file.endsWith('.html')) {
                    console.log(`Copying ${file} to build directory`);
                    const filePath = path.dirname(file);

                    if (!existsSync(path.join(__dirname, 'build', filePath))) {
                        mkdirSync(path.join(__dirname, 'build', filePath), { recursive: true });
                    }

                    copyFileSync(file, path.join(__dirname, 'build', file));
                } else {
                    await processHtmlFile(file);
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