const fse = require('fs-extra');
const glob = require('glob');
const path = require('path');

const _path = path.join(__dirname, 'generate');
const _filename = path.join(_path, 'Holidays.ics');
const _sequence = 0;

async function GetHoliday() {
    const node = [];
    const scanPattern = 'data/**.json';
    const files = glob.sync(scanPattern);

    for (let i = 0; i < files.length; i++) {
        const filePath = path.join(__dirname, files[i]);
        const json = await fse.readJson(filePath);

        json.forEach(item => {
            node.push('BEGIN:VEVENT');

            Object.entries(item).forEach(child => {
                const [key, value] = child;
                node.push(`${key}:${value}`);
            });

            node.push(`SEQUENCE:${_sequence}`);
            node.push('END:VEVENT');
        });
    }
    return node;
}
async function Main() {
    let table = ['BEGIN:VCALENDAR'];
    table.push('VERSION:1.0');
    table.push('X-WR-CALNAME:法定节假日');
    table.push('X-WR-CALDESC:');
    table.push('X-APPLE-CALENDAR-COLOR:#9fa0d7FF');

    const nodes = await GetHoliday();
    table = table.concat(nodes);

    table.push('END:VCALENDAR');

    const result = table.join('\r\n');

    await fse.emptyDir(_path)
    await fse.outputFile(_filename, result);
}

Main();