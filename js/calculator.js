// js/calculator.js

const Calculator = {
    calculate(inputs) {
        const log = [];
        const type = constructionTypes[inputs.projectType];
        if (!type) {
            return { currentTotal: 0, log: ["Моля, изберете вид проект."], error: false };
        }

        const area = inputs.area;
        const category = inputs.projectType.split('.')[0];
        const isCraneEligible = category === 'V' || category === 'VI';
        // Променлива, която определя дали площта е нужна за изчислението
        const needsAreaForCalc = type.type === 'per_m2' || isCraneEligible;
        
        // --- Коригирана Валидация ---
        // Тази проверка за min/max площ трябва да се задейства САМО за типове, които активно използват площта.
        // За типове с 'fixed' цена, min/maxArea служи само за избор на правилната опция, а не за валидация на скрито поле.
        if (needsAreaForCalc && (type.minArea || type.maxArea) && area > 0) {
            if ((type.minArea && area < type.minArea) || (type.maxArea && area > type.maxArea)) {
                return { currentTotal: 0, log: ['НЕВАЛИДНА ПЛОЩ', 'Въведената площ е извън границите за избраната категория.'], error: true };
            }
        }
        
        // Тази проверка остава същата
        if (needsAreaForCalc && area <= 0) {
             return { currentTotal: 0, log: ['Моля, въведете площ.'], error: false };
        }

        // --- Стъпка 1: Изчисляване на базовата цена ---
        let basePrice = 0;
        if (type.type === 'fixed') {
            basePrice = type.basePrice;
            log.push(`Базова цена за "${type.name}": ${basePrice.toFixed(2)} €`);
        } else if (type.type === 'per_m2') {
            basePrice = type.basePrice * area;
            log.push(`Цена по площ: ${area} м² * ${type.basePrice.toFixed(2)} €/м² = ${basePrice.toFixed(2)} €`);
        } else if (type.type === 'retaining_wall') {
            basePrice = type.basePrice * inputs.wallSections;
            log.push(`Цена за сечения: ${inputs.wallSections} бр. * ${type.basePrice.toFixed(2)} €/бр. = ${basePrice.toFixed(2)} €`);
            if (inputs.additionalLength > 0) {
                const lengthMultiplier = Math.floor(inputs.additionalLength / 10);
                if (lengthMultiplier > 0) {
                    const lengthAddition = (type.basePrice * inputs.wallSections * 0.2) * lengthMultiplier;
                    basePrice += lengthAddition;
                    log.push(`+ Дължина (${inputs.additionalLength}м): ${lengthAddition.toFixed(2)} €`);
                }
            }
        }
        
        let price = basePrice;
        let additionsLog = [];
        
        // --- Стъпка 2: Изчисляване на добавките ---
        if (inputs.hasCrane && isCraneEligible) {
            const craneAddition = area * 1.0;
            price += craneAddition;
            additionsLog.push(`+ Кран: ${area} м² * 1.00 €/м² = ${craneAddition.toFixed(2)} €`);
        }

        const priceBeforePercentages = price;

        if (inputs.hasComplexity && inputs.complexityPercentage > 0) {
            const complexityAddition = priceBeforePercentages * (inputs.complexityPercentage / 100);
            price += complexityAddition;
            additionsLog.push(`+ Сложност (${inputs.complexityPercentage}% от ${priceBeforePercentages.toFixed(2)}€): ${complexityAddition.toFixed(2)} €`);
        }
        
        if (inputs.includeSupervision) {
            const priceBeforeSupervision = price;
            const supervisionAddition = priceBeforeSupervision * 0.15;
            price += supervisionAddition;
            additionsLog.push(`+ Авторски надзор (15% от ${priceBeforeSupervision.toFixed(2)}€): ${supervisionAddition.toFixed(2)} €`);
        }

        if (additionsLog.length > 0) {
            log.push(`<b>Допълнителни коефициенти:</b>\n${additionsLog.join('\n')}`);
        }
        
        if (price !== basePrice) {
            log.push(`<b>Крайна сума = ${price.toFixed(2)} €</b>`);
        }

        return { currentTotal: price, log: log, error: false };
    }
};