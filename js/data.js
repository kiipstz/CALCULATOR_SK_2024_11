// js/data.js

const EURO_RATE = 1.95583; // BGN per EUR

const constructionTypes = {
    'I.1': { name: 'Становище (текстова част)', basePrice: 200, type: 'fixed' },
    'I.3': { name: 'Становище (фотоволтаици до 1 MWh)', basePrice: 1000, type: 'fixed' },
    'II.1': { name: 'Еднофамилна СК (до 100 м²)', basePrice: 900, type: 'fixed', maxArea: 100 },
    'II.2': { name: 'Еднофамилна СК (100-200 м²)', basePrice: 1200, type: 'fixed', minArea: 100, maxArea: 200 },
    'II.3': { name: 'Еднофамилна СК (над 200 м²)', basePrice: 6, type: 'per_m2', minArea: 200 },
    'III.1': { name: 'Еднофамилна Дърво/Стомана (до 100 м²)', basePrice: 1200, type: 'fixed', maxArea: 100 },
    'III.2': { name: 'Еднофамилна Дърво/Стомана (100-200 м²)', basePrice: 1500, type: 'fixed', minArea: 100, maxArea: 200 },
    'III.3': { name: 'Еднофамилна Дърво/Стомана (над 200 м²)', basePrice: 7.5, type: 'per_m2', minArea: 200 },
    'IV.1': { name: 'Многофамилна СК (500-1000 м²)', basePrice: 6, type: 'per_m2', minArea: 500, maxArea: 1000 },
    'IV.2': { name: 'Многофамилна СК (1000-3000 м²)', basePrice: 5, type: 'per_m2', minArea: 1000, maxArea: 3000 },
    'IV.3': { name: 'Многофамилна СК (3000-5000 м²)', basePrice: 4, type: 'per_m2', minArea: 3000, maxArea: 5000 },
    'IV.4': { name: 'Многофамилна СК (над 5000 м²)', basePrice: 3.5, type: 'per_m2', minArea: 5000 },
    'V.1': { name: 'Стоманено хале (до 125 м²)', basePrice: 875, type: 'fixed', maxArea: 125 },
    'V.2': { name: 'Стоманено хале (125-600 м²)', basePrice: 7, type: 'per_m2', minArea: 125, maxArea: 600 },
    'V.3': { name: 'Стоманено хале (600-1200 м²)', basePrice: 6, type: 'per_m2', minArea: 600, maxArea: 1200 },
    'V.4': { name: 'Стоманено хале (над 1200 м²)', basePrice: 5, type: 'per_m2', minArea: 1200 },
    'VI.1': { name: 'Сглобяемо СБ хале (до 1500 м²)', basePrice: 7, type: 'per_m2', maxArea: 1500 },
    'VI.2': { name: 'Сглобяемо СБ хале (над 1500 м²)', basePrice: 6, type: 'per_m2', minArea: 1500 },
    'VII.1': { name: 'ПБЗ - Еднофамилни сгради', basePrice: 150, type: 'fixed' },
    'VII.2': { name: 'ПБЗ - Многофамилни сгради, халета', basePrice: 250, type: 'fixed' },
    'VII.3': { name: 'ПБЗ - Събаряне', basePrice: 350, type: 'fixed' },
    'VIII.1': { name: 'Обследване - Пълно', basePrice: 5, type: 'per_m2' },
    'X.1': { name: 'Подпорна стена (до 4м височина)', basePrice: 300, type: 'retaining_wall' },
    'X.2': { name: 'Подпорна стена (над 4м височина)', basePrice: 600, type: 'retaining_wall' }
};

const categoryNames = {
    'I': 'Становища',
    'II': 'Еднофамилни (стоманобетон)',
    'III': 'Еднофамилни (дърво/стомана)',
    'IV': 'Многофамилни сгради',
    'V': 'Стоманени конструкции',
    'VI': 'Сглобяеми СБ конструкции',
    'VII': 'План за безопасност и здраве',
    'VIII': 'Обследване на сгради',
    'X': 'Подпорни стени'
};