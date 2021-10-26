const fse = require('fs-extra');
const glob = require('glob');
const path = require('path');

const _path = path.join(__dirname, 'generate');
const _filename = path.join(_path, 'Cal.ics');
const _sequence = 0;

async function GetHoliday() {
    const node = [];
    const scanPattern = 'data/**.json';
    const files = glob.sync(scanPattern);

    for (let i = 0, len = files.length; i < len; i++) {
        const filePath = path.join(__dirname, files[i]);
        const json = await fse.readJson(filePath);

        json.forEach(item => {
            node.push('BEGIN:VEVENT');
            node.push(`CREATED:${item['DTSTART;VALUE=DATE']}T000001`);

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
    let table = [
        'BEGIN:VCALENDAR',
        'PRODID: -//IU//China Public Holidays/CN',
        'VERSION:2.0',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'CLASS:PUBLIC',
        'X-WR-CALNAME:法定节假日',
        'X-WR-TIMEZONE:Asia/Shanghai',
        'X-WR-CALDESC:中国放假、调休和补班日历',
        'BEGIN:VTIMEZONE',
        'TZID:Asia/Shanghai',
        'X-LIC-LOCATION:Asia/Shanghai',
        'BEGIN:STANDARD',
        'TZOFFSETFROM: +0800',
        'TZOFFSETTO: +0800',
        'TZNAME: CST',
        'DTSTART: 19700101T000000',
        'END: STANDARD',
        'END: VTIMEZONE',
    ];

    const nodes = await GetHoliday();
    table = table.concat(nodes);

    table.push('END:VCALENDAR');

    const result = table.join('\r\n');

    await fse.emptyDir(_path)
    await fse.outputFile(_filename, result);
}

Main();