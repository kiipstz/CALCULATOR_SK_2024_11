// js/ui.js

const UI = {
    elements: {},

    init() {
        this.elements = {
            projectTypeSelect: document.getElementById('projectType'),
            areaInputContainer: document.getElementById('areaInput'),
            areaInput: document.getElementById('area'), // Добавен елемент за лесен достъп
            wallSectionsContainer: document.getElementById('wallSectionsGroup'),
            wallSectionsInput: document.getElementById('wallSections'), // Добавен елемент за лесен достъп
            additionalLengthInput: document.getElementById('additionalLength'), // Добавен елемент за лесен достъп
            craneCheckboxContainer: document.getElementById('craneCheckbox'),
            complexityGroup: document.getElementById('complexityPercentageGroup'),
            coefficientsSection: document.getElementById('coefficientsSection'),
            totalPriceEl: document.getElementById('totalPrice'),
            totalHeader: document.getElementById('totalHeader'),
            calculationLogEl: document.getElementById('calculationLog'),
            displayObjectNameEl: document.getElementById('displayObjectName'),
            priceTableContainer: document.getElementById('priceTableContainer')
        };
        this.populateProjectTypeSelect();
        this.buildPriceTable();
    },

    updateResults(result, inputs) {
        this.elements.displayObjectNameEl.textContent = inputs.objectName;
        this.elements.displayObjectNameEl.style.display = inputs.objectName ? 'block' : 'none';

        if (result.error) {
            this.elements.calculationLogEl.innerHTML = `<span class="log-error">${result.log.join('<br>')}</span>`;
            this.elements.totalPriceEl.textContent = '---';
            this.elements.totalHeader.textContent = 'ОБЩО:';
            return;
        }

        const totalInEur = result.currentTotal;
        const totalInBgn = totalInEur * EURO_RATE;
        let outputText = "";
        
        const formatLine = (line, currency) => {
            return line.replace(/(\d+\.\d{2})\s*€/g, (match, eurValue) => {
                const bgnValue = (parseFloat(eurValue) * EURO_RATE).toFixed(2);
                if (currency === 'bgn') return `${bgnValue} лв.`;
                if (currency === 'both') return `${bgnValue} лв. (${match})`;
                return match; // eur
            });
        };
        
        let logToDisplay = result.log.map(line => formatLine(line, inputs.currencyDisplay));

        switch (inputs.currencyDisplay) {
            case 'bgn':
                this.elements.totalHeader.textContent = 'ОБЩО (лв. без ДДС):';
                outputText = totalInBgn.toFixed(2) + ' лв.';
                break;
            case 'both':
                this.elements.totalHeader.textContent = 'ОБЩО (без ДДС):';
                outputText = `${totalInBgn.toFixed(2)} лв. (${totalInEur.toFixed(2)} €)`;
                break;
            default: // eur
                this.elements.totalHeader.textContent = 'ОБЩО (€ без ДДС):';
                outputText = totalInEur.toFixed(2) + ' €';
                break;
        }

        this.elements.calculationLogEl.innerHTML = logToDisplay.join('\n\n');
        this.elements.totalPriceEl.textContent = outputText;
    },

    populateProjectTypeSelect() {
        const select = this.elements.projectTypeSelect;
        select.innerHTML = '<option value="">-- Изберете вид проект --</option>';
        const grouped = {};
        for (const key in constructionTypes) {
            const category = key.split('.')[0];
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push({ key, ...constructionTypes[key] });
        }

        for (const catKey in categoryNames) {
            if (grouped[catKey]) {
                const group = document.createElement('optgroup');
                group.label = categoryNames[catKey];
                grouped[catKey].forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.key;
                    option.textContent = type.name;
                    group.appendChild(option);
                });
                select.appendChild(group);
            }
        }
    },

    updateInputVisibility(inputs) {
        const type = constructionTypes[inputs.projectType];
        
        // Ако няма избран проект, скриваме и изчистваме всичко
        if (!type) {
            this.elements.areaInputContainer.style.display = 'none';
            this.elements.areaInput.value = ''; // <-- FIX: Изчистване на стойността

            this.elements.wallSectionsContainer.style.display = 'none';
            this.elements.wallSectionsInput.value = '1'; // <-- FIX: Връщане на стойност по подразбиране
            this.elements.additionalLengthInput.value = '0'; // <-- FIX: Връщане на стойност по подразбиране

            this.elements.coefficientsSection.style.display = 'none';
            return;
        }

        const category = inputs.projectType.split('.')[0];
        const isCraneEligible = category === 'V' || category === 'VI';

        // Логика за показване/скриване на полето за площ
        const needsAreaInput = type.type === 'per_m2' || isCraneEligible;
        if (needsAreaInput) {
            this.elements.areaInputContainer.style.display = 'block';
        } else {
            this.elements.areaInputContainer.style.display = 'none';
            this.elements.areaInput.value = ''; // <-- FIX: Изчистваме стойността, когато полето се скрие
        }

        // Логика за показване/скриване на полетата за подпорни стени
        const isRetainingWall = type.type === 'retaining_wall';
        if (isRetainingWall) {
            this.elements.wallSectionsContainer.style.display = 'block';
        } else {
            this.elements.wallSectionsContainer.style.display = 'none';
            // Не е нужно да изчистваме тук, тъй като стойностите им по подразбиране са ОК,
            // но за пълнота може да се добавят, ако създават проблеми.
        }

        // Показване/скриване на останалите контроли
        this.elements.craneCheckboxContainer.style.display = isCraneEligible ? 'block' : 'none';
        this.elements.complexityGroup.style.display = inputs.hasComplexity ? 'block' : 'none';

        const showCoefficients = category !== 'I' && category !== 'VII';
        this.elements.coefficientsSection.style.display = showCoefficients ? 'block' : 'none';
    },

    buildPriceTable() {
        const categoryGroups = [
            { name: "I. Становища", color: "blue", items: [
                ['I.1', 'Становище само с текстова част...', 'мин. 200 €'], ['I.2', 'Проектно решение по чл.147...', 'виж. т.II.1;III.1;V.1'], ['I.3', 'Становище за фотоволтаични централи...', 'мин. 1000 €']
            ]},
            { name: "II. Еднофамилни жилищни сгради-стоманобетонна конструкция", color: "green-light", items: [
                ['II.1', 'РЗП до 100м²', 'мин. 900 €'], ['II.2', 'РЗП от 100м² до 200м²', 'мин. 1200 €'], ['II.3', 'РЗП над 200м²', 'мин. 6 €/м²'], ['', 'Добавка при сложна геометрия...', 'по преценка на проектанта']
            ]},
            { name: "III. Еднофамилни жилищни сгради-дървени конструкции и стоманени конструкции", color: "green-dark", items: [
                ['III.1', 'РЗП до 100м²', 'мин. 1200 €'], ['III.2', 'РЗП от 100м² до 200м²', 'мин. 1500 €'], ['III.3', 'РЗП над 200м²', 'мин. 7.5 €/м²'], ['', 'Добавка при сложна геометрия...', 'по преценка на проектанта']
            ]},
            { name: "IV. Многофамилни жилищни сгради-стоманобетонна конструкция", color: "yellow", items: [
                ['IV.1', 'РЗП от 500м² до 1000м²', 'мин. 6 €/м²'], ['IV.2', 'РЗП от 1000м² до 3000м²', 'мин. 5 €/м²'], ['IV.3', 'РЗП от 3000м² до 5000м²', 'мин. 4 €/м²'], ['IV.4', 'РЗП над 5000м²', 'мин. 3.5 €/м²'], ['', 'Добавка при сложна геометрия...', 'по преценка на проектанта'], ['', 'Проект за укрепване на изкоп...', 'мин. 800 €']
            ]},
            { name: "V. Стоманени конструкции-работен проект", color: "pink", items: [
                ['V.1', 'Правоъгълно складово хале... до 125м²', 'мин. 875 €'], ['V.2', '...от 125м² до 600м²', 'мин. 7 €/м²'], ['V.3', '...от 600м² до 1200м²', 'мин. 6 €/м²'], ['V.4', '...над 1200м²', 'мин. 5 €/м²'], ['V.5', 'За халета с кран', '+ 1 €/м²'], ['', 'Добавка при сложна геометрия...', 'по преценка на проектанта']
            ]},
            { name: "VI. Сглобяеми стоманобетонни конструкции-работен проект", color: "gray", items: [
                ['VI.1', 'Правоъгълно складово хале - РЗП до 1500м²', 'мин. 7 €/м²'], ['VI.2', 'Правоъгълно складово хале - РЗП над 1500м²', 'мин. 6 €/м²'], ['VI.3', 'За халета с кран', '+ 1 €/м²'], ['', 'Добавка при сложна геометрия...', 'по преценка на проектанта']
            ]},
            { name: "VII. План за безопасност и здраве", color: "orange-light", items: [
                ['VII.1', 'Еднофамилни жилищни сгради, преустройства', 'мин. 150 €'], ['VII.2', 'Многофамилни жилищни сгради, халета', 'мин. 250 €'], ['VII.3', 'Събаряне на съществуващи сгради', 'мин. 350 €']
            ]},
            { name: "VIII. Обследване на съществуващи сгради", color: "purple", items: [
                ['VIII.1', 'Пълно обследване...', 'мин. 5 €/м²'], ['VIII.2', 'Частично обследване...', 'по преценка на проектанта']
            ]},
            { name: "IX. Технически контрол", color: "blue-dark", items: [
                ['IX.1', 'Процент от хонорара', '7-10%']
            ]},
            { name: "X. Подпорни стени", color: "orange-dark", items: [
                ['X.1', 'До 4м височина за 1 брой сечение', 'мин. 300 €'], ['X.2', 'Над 4м височина за 1 брой сечение', 'мин. 600 €'], ['', 'Добавка за всеки следващи 10м\'', '20%']
            ]},
            { name: "XI. Авторски надзор", color: "red", items: [
                ['XI.1', 'Като процент от хонорара', 'мин. 15%'],
                ['XI.2', 'Часова ставка', 'мин 75 €/посещение(1ч)+ 30€ добавка за всеки следващ започнат час']
            ]}
        ];

        let tableHtml = `<h2>Себестойност на проектантския труд по част "СК"</h2>
        <table><thead><tr><th>Раздел</th><th>Описание</th><th>Минимална цена</th></tr></thead><tbody>`;

        categoryGroups.forEach(group => {
            const colorClass = `table-cat-${group.color}`;
            const lightColorClass = `${colorClass}-light`;
            tableHtml += `<tr class="section ${colorClass}"><td colspan="3">${group.name}</td></tr>`;
            group.items.forEach(item => {
                tableHtml += `<tr class="${lightColorClass}"><td>${item[0]}</td><td>${item[1]}</td><td>${item[2]}</td></tr>`;
            });
        });

        tableHtml += '</tbody></table>';
        this.elements.priceTableContainer.innerHTML = tableHtml;
    },

    openPriceTable() {
        const tableHtml = this.elements.priceTableContainer.innerHTML;
        const newWindow = window.open("", "TableWindow", "width=900,height=800,scrollbars=yes,resizable=yes");
        newWindow.document.write(`<html><head><title>Таблица с цени - СК</title><style>
            body{font-family:Arial,sans-serif;padding:20px}
            table{width:100%;border-collapse:collapse}
            th,td{border:1px solid #ddd;padding:8px;text-align:left}
            th{background-color:#e9e9e9} .section td{font-weight:bold; color:#000;}
            .print-button-container { text-align: center; margin-top: 20px; }
            .action-button { padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #3a86ff; color: white; border: none; border-radius: 5px; }
            .action-button:hover { background-color: #3375e0; }
            .table-cat-blue { background-color: #d9e2f3; } .table-cat-blue-light { background-color: #ebf0fa; }
            .table-cat-green-light { background-color: #e2efd9; } .table-cat-green-light-light { background-color: #f0f7ea; }
            .table-cat-green-dark { background-color: #c5e0b3; } .table-cat-green-dark-light { background-color: #e2f0d9; }
            .table-cat-yellow { background-color: #fff2cc; } .table-cat-yellow-light { background-color: #fff9e5; }
            .table-cat-pink { background-color: #f8cbad; } .table-cat-pink-light { background-color: #fcebe3; }
            .table-cat-gray { background-color: #d9d9d9; } .table-cat-gray-light { background-color: #f2f2f2; }
            .table-cat-orange-light { background-color: #fde4d8; } .table-cat-orange-light-light { background-color: #feefe8; }
            .table-cat-purple { background-color: #e4dfec; } .table-cat-purple-light { background-color: #f1eff6; }
            .table-cat-blue-dark { background-color: #bdd6ee; } .table-cat-blue-dark-light { background-color: #ddeaf7; }
            .table-cat-orange-dark { background-color: #fbe5d5; } .table-cat-orange-dark-light { background-color: #fdf2ea; }
            .table-cat-red { background-color: #f8c8c8; } .table-cat-red-light { background-color: #fce6e6; }
            @media print { 
                .print-button-container { display: none; } 
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
        </style></head><body>
        ${tableHtml}
        <div class="print-button-container"><button class="action-button" onclick="window.print()">Принтирай таблицата</button></div>
        </body></html>`);
        newWindow.document.close();
    },

    printOffer(logContent, finalPriceText, objectName) {
        const printHtml = `<html><head><title>Оферта - ${objectName}</title><style>body{font-family: Arial, sans-serif; margin: 30px;} h1, h2, h3 { color: #333; } pre { white-space: pre-wrap; font-family: monospace; font-size: 14px; background-color: #f4f4f4; padding: 15px; border-radius: 5px; } hr { margin: 20px 0; border-top: 1px solid #ccc; }</style></head><body><h1>Минимална себестойност на проектиране – ЧАСТ КОНСТРУКЦИИ</h1><h2>Обект: ${objectName}</h2><hr><h3>Начин на изчисляване:</h3><pre>${logContent.replace(/<b>/g, '').replace(/<\/b>/g, '')}</pre><hr><h2>${finalPriceText}</h2></body></html>`;
        const win = window.open('', '', 'height=700,width=800');
        win.document.write(printHtml);
        win.document.close();
        win.print();
    }
};