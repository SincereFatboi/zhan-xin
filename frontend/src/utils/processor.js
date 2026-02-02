import * as cheerio from "cheerio";
import { transpose } from "chord-transposer";

export const parseHtmlFile = (doc, changeKey) => {
  // const doc = await fs.promises.readFile("Test_Score.html", "utf-8");
  const $ = cheerio.load(doc);

  // Constants
  const rootNaturals = ["A", "B", "C", "D", "E", "F", "G"];
  const sharpsFlats = ["#", "b"];
  const chordQualities = ["maj", "min", "m", "dim", "aug", "alt", "+"];
  const chordModifiers = ["sus", "add"];
  const chordNumbers = ["13", "11", "9", "7", "6", "5", "4", "3", "2"];
  const partialSlash = ["/"];
  const allPartials = [
    ...sharpsFlats,
    ...chordQualities,
    ...chordModifiers,
    ...chordNumbers,
    ...partialSlash,
  ];

  // Methods
  const extractNodes = (node) => {
    const result = [];

    const traverse = (node) => {
      node.contents().each((index, element) => {
        if (element.type === "text") {
          result.push(element.data);
        } else if (element.type === "tag") {
          traverse($(element));
        }
      });
    };

    traverse(node);
    return result;
  };

  const replaceNode = (node, indexText, newText) => {
    let textNodeCount = 0;

    const positiveIndexText =
      indexText < 0 ? extractNodes(node).length + indexText : indexText;

    const traverse = (node) => {
      node.contents().each((index, element) => {
        if (element.type === "text") {
          if (textNodeCount === positiveIndexText) {
            element.data = newText;
          }
          textNodeCount++;
        } else if (element.type === "tag") {
          traverse($(element));
        }
      });
    };

    traverse(node);
  };

  const chordValidator = (input) => {
    input = input.replace(/[\s\u2800]+/g, "").replaceAll("|", "");

    const cleaned = input.replace(/[^0-9]+/g, " ");
    const onlyNumbers = cleaned.trim().split(/\s+/).filter(Boolean);

    for (const num of onlyNumbers) {
      if (!chordNumbers.includes(num)) {
        return false;
      }
    }

    // Temporarily remove all known numbers
    chordNumbers.forEach((num) => {
      input = input.replaceAll(num, "");
    });

    const root = "[A-G](?:#|b)?";
    const quality = `(?:${chordQualities
      .map((q) => q.replace(/[.+]/g, "\\$&"))
      .join("|")})?`;
    const modifier = `(?:${chordModifiers.join("|")})?`;
    const slash = `(?:/${root})?`;

    const chord = `${root}${quality}${modifier}${slash}`;
    const tokenRegex = new RegExp(chord, "g");
    const fullMatch = input.match(tokenRegex)?.join("");

    return fullMatch === input;
  };

  const splitChords = (input) => {
    input = input.replace(/[\s\u2800]+/g, "");

    const pattern = /([A-G](?:#|b)?[^A-G]*)/g;
    let parts = input.match(pattern) || [];

    // Merge parts ending with a slash
    for (let i = 0; i < parts.length - 1; i++) {
      if (parts[i].endsWith("/")) {
        parts[i] += parts[i + 1];
        parts.splice(i + 1, 1);
        i--;
      }
    }

    // Validate: max one slash per part, and not ending with slash
    for (const chord of parts) {
      const slashCount = (chord.match(/\//g) || []).length;
      if (slashCount > 1 || chord.endsWith("/")) {
        return false;
      }
    }

    return parts;
  };

  const toText = (input) => {
    return input.join("").replace(/[\s\u2800]+/g, "");
  };

  const directionalSearch = (searchArr, conds, direction = "forward") => {
    const fullText = toText(searchArr);

    const matched =
      direction === "reverse"
        ? conds.find((suffix) => fullText.endsWith(suffix))
        : conds.find((prefix) => fullText.startsWith(prefix));

    if (!matched) return false;

    const currentSearch = [];

    if (direction === "reverse") {
      outerLoop: for (let i = searchArr.length - 1; i >= 0; i--) {
        const chunk = searchArr[i];

        for (let j = chunk.length - 1; j >= 0; j--) {
          if (currentSearch.length === matched.length) break outerLoop;

          const char = chunk[j];
          if (char === " " || char === "\u2800") {
            continue;
          }

          currentSearch.push({
            index: i,
            position: j,
            char: char,
          });
        }
      }
      return { metConds: matched, chars: currentSearch.reverse() };
    } else {
      outerLoop: for (let i = 0; i < searchArr.length; i++) {
        const chunk = searchArr[i];
        for (let j = 0; j < chunk.length; j++) {
          if (currentSearch.length === matched.length) break outerLoop;
          if (chunk[j] === " " || chunk[j] === "\u2800") {
            continue;
          } else {
            currentSearch.push({
              index: i,
              position: j,
              char: chunk[j],
            });
          }
        }
      }
      return { metConds: matched, chars: currentSearch };
    }
  };

  const modifyString = (
    inputString,
    position,
    text,
    mode = "insert",
    length = 1,
  ) => {
    switch (mode) {
      case "insert":
        return (
          inputString.slice(0, position + 1) +
          text +
          inputString.slice(position + 1)
        );

      case "replace":
        return (
          inputString.slice(0, position) +
          text +
          inputString.slice(position + length)
        );

      case "delete":
        return (
          inputString.slice(0, position) + inputString.slice(position + length)
        );

      default:
        throw new Error(`Unknown mode: ${mode}`);
    }
  };

  const chordCleaner = (arr, splitChords) => {
    let splitChordsIndex = splitChords.length - 1;
    for (let i = arr.length - 1; i >= 0; i--) {
      const el = arr[i]; // e.g., a string

      for (let j = el.length - 1; j >= 0; j--) {
        const character = el[j];
        const correctChord = splitChords[splitChordsIndex];

        const whitespaceRegexUnicode =
          /[\s\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/u;

        if (whitespaceRegexUnicode.test(character)) {
          continue;
        }

        if (character === correctChord.charAt(0)) {
          arr[i] = modifyString(
            arr[i],
            j,
            correctChord,
            "replace",
            correctChord.length,
          );
          splitChordsIndex--;

          if (splitChordsIndex < 0) {
            return arr;
          }
        } else {
          arr[i] = modifyString(arr[i], j, "\u00a0", "replace");
        }
      }
    }

    return arr;
  };

  const getElementClassnames = (html, letter) => {
    const classnamesArray = html.attr("class").split(" ");

    for (let i = 0; classnamesArray.length; i++) {
      if (classnamesArray[i].startsWith(letter)) return classnamesArray[i];
    }

    return null;
  };

  const getStylesForClassName = (className) => {
    // Extract styles from the <style> tag
    const styles = {};
    $("style").each((i, style) => {
      const styleText = $(style).html();
      const rules = styleText.split("}");
      rules.forEach((rule) => {
        const [selectors, style] = rule.split("{");
        if (selectors && style) {
          selectors.split(",").forEach((selector) => {
            const clsName = selector.trim().replace(".", "");
            if (clsName) {
              // Parse the style string into an object
              const styleObj = style
                .trim()
                .split(";")
                .reduce((acc, property) => {
                  const [key, value] = property.split(":");
                  if (key && value) {
                    acc[key.trim()] = value.trim();
                  }
                  return acc;
                }, {});
              styles[clsName] = styleObj;
            }
          });
        }
      });
    });

    // Return the styles for the given class name
    return styles[className] || {};
  };

  const getNumericalValue = (string) => {
    // Regular expression to match digits with optional decimal point and trailing alphabets
    const regex = /(\d+\.?\d*)([a-zA-Z]*)/;
    const match = regex.exec(string);

    if (match) {
      // Extract the numerical part (group 1) and convert to float
      return parseFloat(match[1]);
    } else {
      // No numerical value found
      return null;
    }
  };

  const checkYCoor = (element) => {
    if (!element.prev() || !element) {
      return true;
    } else {
      const isYCoorClose =
        Math.abs(
          getNumericalValue(
            getStylesForClassName(getElementClassnames(element, "y")).bottom,
          ) -
            getNumericalValue(
              getStylesForClassName(getElementClassnames(element.prev(), "y"))
                .bottom,
            ),
        ) < 7;

      return isYCoorClose;
    }
  };

  const pageCount = $("#page-container").children().length;

  // Format score
  for (let i = 1; i <= pageCount; i++) {
    let depth = $(`.pc${i}`);

    for (let j = 1; j < 10; j++) {
      if (depth.children("div").length === 0) {
        break;
      } else {
        depth = depth.children("div");
      }
    }

    // Manage partials
    depth.each((_, element) => {
      if (
        splitChords(toText(extractNodes($(element).prev()))).length > 0 &&
        chordValidator(
          splitChords(toText(extractNodes($(element).prev()))).at(-1),
        ) &&
        directionalSearch(extractNodes($(element)), allPartials)?.metConds &&
        checkYCoor($(element))
      ) {
        const allPartialsPos = directionalSearch(
          extractNodes($(element)),
          allPartials,
        );
        const validChordPos = directionalSearch(
          extractNodes($(element).prev()),
          [`${splitChords(toText(extractNodes($(element).prev()))).at(-1)}`],
          "reverse",
        );

        if (
          chordValidator(
            validChordPos.metConds + allPartialsPos.metConds.replace(/\//g, ""),
          )
        ) {
          allPartialsPos.chars.forEach((char) => {
            replaceNode(
              $(element),
              char.index,
              modifyString(
                extractNodes($(element))[char.index],
                char.position,
                "\u2800",
                "replace",
              ),
            );
          });

          replaceNode(
            $(element).prev(),
            validChordPos.chars.at(-1).index,
            modifyString(
              extractNodes($(element).prev())[validChordPos.chars.at(-1).index],
              validChordPos.chars.at(-1).position,
              allPartialsPos.metConds,
              "insert",
            ),
          );

          if (toText(extractNodes($(element))).length === 0) {
            $(element).remove();
          }
        }
      }
    });

    // Manage slash
    depth.each((_, element) => {
      if (
        directionalSearch(
          extractNodes($(element).prev()),
          partialSlash,
          "reverse",
        )?.metConds &&
        chordValidator(splitChords(toText(extractNodes($(element)))).at(0))
      ) {
        const validChordPos = directionalSearch(extractNodes($(element)), [
          `${splitChords(toText(extractNodes($(element)))).at(0)}`,
        ]);
        const slashPos = directionalSearch(
          extractNodes($(element).prev()),
          partialSlash,
          "reverse",
        );

        validChordPos.chars.forEach((char) => {
          replaceNode(
            $(element),
            char.index,
            modifyString(
              extractNodes($(element))[char.index],
              char.position,
              "\u2800",
              "replace",
            ),
          );
        });

        replaceNode(
          $(element).prev(),
          validChordPos.chars.at(-1).index,
          modifyString(
            extractNodes($(element).prev())[validChordPos.chars.at(-1).index],
            slashPos.chars.at(-1).position,
            validChordPos.metConds,
            "insert",
          ),
        );
      }
    });

    // Format and transpose chords
    depth.each((_, element) => {
      const nodes = extractNodes($(element));
      const nodesText = toText(nodes);
      if (!chordValidator(nodesText)) return;

      const split = splitChords(nodesText);
      if (!split) return;

      const cleanedChords = chordCleaner(nodes, split);

      cleanedChords.forEach((chord, idx) => {
        try {
          if (chord && chord.replace(/[\s\u2800]+/g, "") !== "") {
            replaceNode(
              $(element),
              idx,
              transpose(chord).up(changeKey).toString().replace(/b/g, "\u266D"),
            );
          } else {
            replaceNode($(element), idx, (chord || "").replace(/b/g, "\u266D"));
          }
        } catch (err) {
          console.error("Error transposing chord:", chord);
          const safeChord = chord || "";
          let charsToUpdate = "";
          for (let i = 0; i < safeChord.length; i++) {
            if (rootNaturals.includes(safeChord[i])) {
              if (sharpsFlats.includes(safeChord[i + 1])) {
                const transposedRoot = transpose(safeChord.slice(i, i + 2))
                  .up(changeKey)
                  .toString();
                charsToUpdate += transposedRoot;
              } else {
                const transposedRoot = transpose(safeChord[i])
                  .up(changeKey)
                  .toString();
                charsToUpdate += transposedRoot;
              }
            } else {
              charsToUpdate += safeChord[i];
            }
          }

          replaceNode($(element), idx, charsToUpdate.replace(/b/g, "\u266D"));
          console.error("Attempt transposing chord:", charsToUpdate);
        }
      });
    });
  }
  return $.html();
};
