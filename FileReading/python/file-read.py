arr = list(map(int, input().split()))

file_name = "myfile.txt"

f = open(file_name, "r")
string = ""
count = [0]*10
string = f.read()
print(string)
print("I'v read smth with len---", len(string))
i = 0
buff = [[0]*10 for i in range(10)]
i = 0
j = 0
x, y, dx, dy = [0]*4

while (i < len(string)) :
    k = 0
    while (string[i] != '\n') :
        if (string[i] != '\t'):
            buff[j][k] = string[i]
            k+=1
        i+=1
    j+=1
    i+=1

print(buff)
print("Write number of x y dx dy:")


print("df")
if (len(arr) == 2):
    x = arr[0]
    y = arr[1]
elif (len(arr) == 3):
    x = arr[0]
    y = arr[1]
    dx = arr[2]
elif (len(arr) == 4):
    x = arr[0]
    y = arr[1]
    dx = arr[2]
    dy = arr[3]
print(x, y, dx, dy)