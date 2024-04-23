var fileContent;
var averageError;
var averageErrorSquare;

function func(t) {
    if (t > -Math.PI && t <= Math.PI) return (Math.PI * Math.PI) / 12 - (t * t) / 4;
    else if (t <= -Math.PI) return func(t + 2 * Math.PI);
    else return func(t - 2 * Math.PI);
}

function integrate(func, from, to, dx = 0.0001) {
    let result = 0;
    for (let x = from; x < to; x += dx) {
        result += func(x) * dx;
    }
    return result;
}

function updateChart() {
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }
    let from = parseFloat(document.getElementById('from').value);
    let to = parseFloat(document.getElementById('to').value);
    let N = parseInt(document.getElementById('N').value);

    let coefficients = [];

    let a0 = (1 / Math.PI) * integrate((t) => func(t), -Math.PI, Math.PI);
    
    for (let n = 1; n <= N; n++) {
        let a_n = (1 / Math.PI) * integrate((t) => func(t) * Math.cos(n * t), -Math.PI, Math.PI);
        let b_n = (1 / Math.PI) * integrate((t) => func(t) * Math.sin(n * t), -Math.PI, Math.PI);
        coefficients.push({a: a_n, b: b_n});
    }

    let fourierData = [];
    let functionData = [];
    let errorSum = 0;
    let errorSumSquare = 0;

    for (let t = from * Math.PI; t <= to * Math.PI; t += 0.01) {
        let sum = 0;
        for (let n = 1; n <= N; n++) {
            let { a, b } = coefficients[n - 1];
            sum += a * Math.cos(n * t) + b * Math.sin(n * t);
        }
        let approximation = sum + a0 / 2;
        let original = func(t);
        errorSum += Math.abs(original - approximation);
        errorSumSquare += (original - approximation) * (original - approximation);

        fourierData.push({ x: t, y: approximation });
        functionData.push({ x: t, y: original });
    }

    averageError = errorSum / ((to - from) * Math.PI / 0.01);
    averageErrorSquare = errorSumSquare / ((to - from) * Math.PI / 0.01);
    document.getElementById('average').innerHTML = averageError;
    document.getElementById('averageSquare').innerHTML = averageErrorSquare;

    let ctx = document.getElementById('myChart').getContext('2d');

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: "Ряд Фур'є",
                data: fourierData,
                borderColor: 'green',
                borderWidth: 1,
                fill: false
            }, {
                label: 'f(t)',
                data: functionData,
                borderColor: 'red',
                borderWidth: 1,
                fill: false
            },
        ]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    type: 'linear',
                    position: 'left'
                }
            },
            plugins: {
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy',
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    fileContent = `Інтервал: від ${from}π до ${to}π\n`;
    fileContent += `N: ${N}\n`;
    fileContent += `a0: ${a0}\n`;
    fileContent += `Середня абсолютна похибка: ${averageError}\n`;
    fileContent += `Середня квадратична похибка: ${averageErrorSquare}\n\n`;
    fileContent += "Коефіцієнти Фур'є:\n";
    coefficients.forEach((coeff, index) => {
        fileContent += `a${index + 1}: ${coeff.a}, b${index + 1}: ${coeff.b}\n`;
    });
}

function saveToFile() {
    if (fileContent) {
        let blob = new Blob([fileContent], {type: "text/plain;charset=utf-8"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'fourier_data.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        console.log("No data to save.");
    }
}

updateChart();