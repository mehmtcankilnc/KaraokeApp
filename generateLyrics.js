const fs = require("fs");
const path = require("path");

const SRT_DIR = path.join(__dirname, "src/assets", "raw_srt");
const OUTPUT_DIR = path.join(__dirname, "src/assets", "lyrics");
const INDEX_FILE = path.join(OUTPUT_DIR, "index.ts");

const timeToMs = (timeString) => {
  const [time, ms] = timeString.split(",");
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600000 + minutes * 60000 + seconds * 1000 + Number(ms);
};

const parseSrt = (srtText) => {
  const normalizedText = srtText.replace(/\r\n/g, "\n");
  const blocks = normalizedText.split("\n\n");
  const lyrics = [];

  blocks.forEach((block) => {
    const lines = block.split("\n").filter((line) => line.trim() !== "");
    if (lines.length >= 3) {
      const id = parseInt(lines[0], 10);
      const timeLine = lines[1];
      const text = lines.slice(2).join("\n");
      const [startStr, endStr] = timeLine.split(" --> ");

      if (startStr && endStr) {
        lyrics.push({
          id,
          startTime: timeToMs(startStr),
          endTime: timeToMs(endStr),
          text,
        });
      }
    }
  });
  return lyrics;
};

const generate = () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SRT_DIR).filter((file) => file.endsWith(".srt"));
  let indexContent = `export const lyricsData: Record<string, NodeRequire> = {\n`;

  files.forEach((file) => {
    const filePath = path.join(SRT_DIR, file);
    const srtText = fs.readFileSync(filePath, "utf-8");

    const parsedData = parseSrt(srtText);

    const fileNameWithoutExt = path.parse(file).name;
    const jsonFileName = `${fileNameWithoutExt}.json`;
    fs.writeFileSync(
      path.join(OUTPUT_DIR, jsonFileName),
      JSON.stringify(parsedData, null, 2),
    );

    indexContent += `  "${fileNameWithoutExt}": require('./${jsonFileName}'),\n`;
  });

  indexContent += `};\n`;

  fs.writeFileSync(INDEX_FILE, indexContent);
};

generate();
