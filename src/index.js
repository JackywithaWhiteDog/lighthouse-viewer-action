const fs = require('fs');

const core = require('@actions/core');
const { glob } = require("glob");
const ui = require('cliui')();
const chalk = require('chalk');

chalk.level = 3;

const Color = {
    green: 'green',
    yellow: 'yellow',
    red: 'red',
};

const ChalkColor = {
    [Color.green]: chalk.green,
    [Color.yellow]: chalk.yellow,
    [Color.red]: chalk.red,
};

const Icon = {
    [Color.green]: ChalkColor[Color.green]('●'),
    [Color.yellow]: ChalkColor[Color.yellow]('■'),
    [Color.red]: ChalkColor[Color.red]('▲'),
};

const getColor = (score) => {
    if (score >= 0.9) return Color.green;
    if (score >= 0.5) return Color.yellow;
    return Color.red;
};

const main = async () => {
    const results_path = core.getInput('resultsPath');
    const filenames = await glob(`${results_path}/lhr-*.json`)

    filenames.forEach((filename, i) => {
        if (!filename.match(/.*\.json/)) return
        const report = JSON.parse(fs.readFileSync(filename), 'utf-8');

        ui.resetOutput();
        if (i != 0) {
            ui.div('')
        }
        ui.div({ text: report.finalUrl, border: true, width: 100 });
        Object.keys(report.categories).forEach((key, i) => {
            const category = report.categories[key];
            // Title
            const titleColor = getColor(category.score);
            if (i != 0) {
                ui.div('')
            }
            ui.div(
                { text: '', width: 4 },
                { text: Icon[titleColor], width: 4 },
                { text: `${category.title}:`, width: 20 },
                { text: ChalkColor[titleColor](`${Math.round(category.score * 100)}`) }
            );

            // Metrics
            const metrics_columns = 2;
            const metrics = category.auditRefs.filter(ref => ref.group === 'metrics').map(ref => ref.id);
            for (let i = 0; i < metrics.length; i += metrics_columns) {
                ui.div(
                    { text: '', width: 8 },
                    ...metrics.slice(i, i+metrics_columns).map(id => {
                        const color = getColor(report.audits[id].score);
                        return [
                            { text: Icon[color], width: 4 },
                            { text: id, width: 25 },
                            { text: ChalkColor[color](`${report.audits[id].displayValue}`), width: 20 }
                        ]
                    }).flat()
                );
            }

            // Explanations
            const explain_columns = 1;
            const lowPerf = category.auditRefs.filter(ref => (
                ref.group !== 'hidden' && ref.group !== 'metrics' && report.audits[ref.id].score != null && report.audits[ref.id].score < 0.9
            ));
            const groups = {};
            lowPerf.forEach(ref => {
                const group = ref.group != null ? report.categoryGroups[ref.group].title : 'Diagnostics';
                if (group in groups) {
                    groups[group].push(ref.id);
                } else {
                    groups[group] = [ref.id];
                }
            })
            Object.keys(groups).forEach(key => {
                const ids = groups[key].sort((a, b) => report.audits[a].score - report.audits[b].score);
                ui.div({ text: '', width: 8 }, {text: chalk.underline(`${key}:`)});
                for (let i = 0; i < ids.length; i += explain_columns) {
                    ui.div(
                        { text: '', width: 12 },
                        ...ids.slice(i, i+explain_columns).map(id => {
                            const color = getColor(report.audits[id].score);
                            return [
                                { text: Icon[color], width: 4 },
                                { text: id, width: 30 },
                                { text: ChalkColor[color](`${report.audits[id].explanation ?? report.audits[id].title}`), width: 80 },
                            ]
                        }).flat()
                    );
                }
            })
        })
        console.log(ui.toString());
    })

    const outcome = core.getInput('lighthouseOutcome');
    if (outcome == 'failure') throw Error('Failed in auditing with Lighthouse');
}

main()
    .catch(err => core.setFailed(err.message))
    .then(() => core.debug(`done in ${process.uptime()}s`))
