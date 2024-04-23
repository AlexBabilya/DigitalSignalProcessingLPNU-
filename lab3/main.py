import matplotlib.pyplot as plt
import numpy as np
import math

start = -math.pi
diff = 2 * math.pi / 7
precisionSize = 0.001
n = 10

xDiscrete = []

yDiscrete = [0.54, 0.51, 0.47, 0.45, 0.42, 0.38]
ak = []
bk = []
a0 = 0

x3 = np.arange(-np.pi, np.pi, precisionSize)
y3 = []

x2 = x3
y2 = []

avgError = 0


def fillX():
    for i in range(1, 7):
        xDiscrete.append(start + i * diff)


# FOURIER functions
def getAN(k, x, y):
    an = 0
    for ind in range(len(x)):
        an += y[ind] * math.cos(k * x[ind])
    an *= 2 / len(y)
    # print(f'a{k} = {an}')
    return an


def getBN(k, x, y):
    bn = 0
    for ind in range(len(x)):
        bn += y[ind] * math.sin(k * x[ind])
    bn *= 2 / len(y)
    # print(f'b{k} = {bn}')
    return bn


def getA0(y):
    sum = 0
    for ind in range(len(y)):
        sum += y[ind]
    a0 = sum * (2 / len(y))
    # print(f'a0 = {a0}')
    return a0


def getFourierOneSum(x, i):
    return ak[i - 1] * math.cos(i * x) + bk[i - 1] * math.sin(i * x)


def getFourierAtPoint(x):
    sum = a0 / 2.0
    for i in range(1, n + 1):
        sum += getFourierOneSum(x, i)
    return sum


# POLYNOM functions
def normal(x, y):
    sys = []
    for i in range(3):
        sys.append([])
    for k in range(3):
        for j in range(3):
            tmp = 0
            for i in range(len(x)):
                tmp += pow(x[i], j + k)
            sys[k].append(tmp)
        t = 0
        for i in range(len(y)):
            t += y[i] * pow(x[i], k)
        sys[k].append(t)
    return sys


def gauss(sys, res):
    k = 0
    while k < 3:
        for i in range(k, 3):
            temp = sys[i][k]
            if sys[i][k] == 0:
                continue
            for j in range(k, 4):
                sys[i][j] /= temp
            if i == k:
                continue
            for j in range(k, 4):
                sys[i][j] -= sys[k][j]
        k += 1
    k = 2
    while k >= 0:
        res.append(sys[k][3])
        for i in range(k):
            sys[i][3] -= sys[i][k] * res[-1]
        k -= 1


def polynom(indexes, x):
    return indexes[0] * x**2 + indexes[1] * x + indexes[2]  # ax^2 + bx + c


def getAverageError(polIndexes):
    fourierError = 0
    polynomError = 0
    for i in range(len(xDiscrete)):
        curF = getFourierAtPoint(xDiscrete[i])
        fourierError += abs(curF - yDiscrete[i])
        curP = polynom(polIndexes, xDiscrete[i])
        polynomError += abs(curP - yDiscrete[i])
    fourierError /= len(xDiscrete)
    polynomError /= len(xDiscrete)
    print("Істинна середня абсолютна похибка:\nРяд Фур'є: " + str(fourierError) + "\nПоліном: " + str(polynomError))


fillX()

indexes = []
gauss(normal(xDiscrete, yDiscrete), indexes)
print("Формула квадратичного полінома: f(x) = " + str(round(indexes[0], 5)) + "x^2 + " + str(round(indexes[1], 2)) + "x + " + str(round(indexes[2], 2)))

for i in x3:
    y3.append(polynom(indexes, i))

# Fourier coefficients
for i in range(1, n + 1):
    ak.append(getAN(i, x3, y3))
    bk.append(getBN(i, x3, y3))
a0 = getA0(y3)

# Getting Fourier
for coor in x2:
    y2.append(getFourierAtPoint(coor))

getAverageError(indexes)

# Showing plots
plt.plot(xDiscrete, yDiscrete, 'yo', alpha=0.6)
plt.plot(x2, y2)
plt.plot(x3, y3)
plt.grid()
plt.title('Approximation')
plt.show()
