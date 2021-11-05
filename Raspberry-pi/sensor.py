import serial
import firebase

dec_acc_x = 0
dec_acc_y = 0
dec_acc_z = 0

dec_gyr_x = 0
dec_gyr_y = 0
dec_gyr_z = 0


def receive_data():
    serialport = serial.Serial(port="/dev/serial0", baudrate=921600, parity=serial.PARITY_NONE,
                               stopbits=serial.STOPBITS_ONE, bytesize=serial.EIGHTBITS, timeout=5)
    try:
        response = serialport.readline(128)
    except serial.serialutil.SerialException:
        pass

    response_a = " ".join(hex(n) for n in response)

    # print(" ".join(hex(n) for n in response))

    data = []
    data.append(response_a)

    data_2 = response_a.split()

    #     print(data_2)

    data_0 = []

    for i in data_2:
        if (len(i) != 4):
            temp = '0' + i[2:]
        else:
            temp = i[2:4]
        data_0.append(temp)
    #     print(data_0)
    return data_0


def check_data():
    # get mac
    sensors_address = firebase.get_sensor_mac()
    mac_0 = sensors_address[0:2]
    mac_1 = sensors_address[2:4]
    mac_2 = sensors_address[4:6]
    mac_3 = sensors_address[6:8]
    mac_4 = sensors_address[8:10]
    mac_5 = sensors_address[10:12]

    data_0 = receive_data()
    #     print(data_0)
    check = 0
    check_num = ''
    real_data = []
    real_stat = False
    check_index = 0
    check_stat = False

    for index, i in enumerate(data_0):
        #     print(i)
        if i == mac_0 and check == 0:
            check = check + 1
            check_num = check_num + i + ' '
            real_data.append(i)
        if i == mac_1 and check == 1:
            check = check + 1
            check_num = check_num + i + ' '
            real_data.append(i)
        if i == mac_2 and check == 2:
            check = check + 1
            check_num = check_num + i + ' '
            real_data.append(i)
        if i == mac_3 and check == 3:
            check = check + 1
            check_num = check_num + i + ' '
            real_data.append(i)
        if i == mac_4 and check == 4:
            check = check + 1
            check_num = check_num + i + ' '
            real_data.append(i)
        if i == mac_5 and check == 5:
            check = check + 1
            check_num = check_num + i + ' '
            real_data.append(i)
        if i == '02' and check == 6:
            check = check + 1
            check_num = check_num + i + ' '
            real_data.append(i)
        #         print(check_num)
        if i == '01' and check == 7:
            check_num = check_num + i + ' '
            check = check + 1
            real_data.append(i)
        #         print(check_num)
        if i == '04' and check == 8:
            check_num = check_num + i + ' '
            check = check + 1
            real_data.append(i)
        #         print(check_num)
        if i == '15' and check == 9:
            check_num = check_num + i + ' '
            check = check + 1
        if check == 10:
            check_stat = True

        if check_stat == True:
            check_index += 1
            real_data.append(i)
        if check_index == 24:
            real_stat = True
            break
    if real_stat == True:
        #         print("Found info data!")
        #         print("check_num ",check_num)
        #         print("check_index ",check_index)
        #         print("real data:", real_data)
        #         real_data.clear()
        f = open('in_data.txt', 'w')
        f.write(" ".join(data_0))
        f.close()
        f1 = open('sensor_data.txt', 'w')
        f1.write(" ".join(real_data))
        f1.close()
        return real_data
    else:
        #         print("Miss")
        return 0


def process_data():
    process_stat = False
    while 1:
        data = check_data()
        if data == 0:
            continue
        else:
            process_stat = True
            break
    if process_stat == True:
        begin = False
        begin_index = 0

        check_time = 2

        acc_x_time = 0
        acc_y_time = 0
        acc_z_time = 0

        gyr_x_time = 0
        gyr_y_time = 0
        gyr_z_time = 0

        acc_x_stat = False
        acc_y_stat = True
        acc_z_stat = True

        gyr_x_stat = True
        gyr_y_stat = True
        gyr_z_stat = True

        acc_x = []
        acc_y = []
        acc_z = []

        gyr_x = []
        gyr_y = []
        gyr_z = []
        for index, i in enumerate(data):
            # ACC_X data
            if acc_x_stat == False and begin == True:
                if i == 'fe':
                    check_time = 3
                acc_x.append(i)
                acc_x_time += 1

            if acc_x_time == check_time:
                acc_x_stat = True
                check_time = 2
                acc_y_stat = False
                acc_x_time = -1
                continue

            # ACC_Y data
            if acc_y_stat == False and begin == True:
                if i == 'fe':
                    check_time = 3
                acc_y.append(i)
                acc_y_time += 1

            if acc_y_time == check_time:
                acc_y_stat = True
                check_time = 2
                acc_z_stat = False
                acc_y_time = -1
                continue

            # ACC_Z data
            if acc_z_stat == False and begin == True:
                if i == 'fe':
                    check_time = 3
                acc_z.append(i)
                acc_z_time += 1

            if acc_z_time == check_time:
                acc_z_stat = True
                check_time = 2
                gyr_x_stat = False
                acc_z_time = -1
                continue

            # GRY_x data
            if gyr_x_stat == False and begin == True:
                if i == 'fe':
                    check_time = 3
                gyr_x.append(i)
                gyr_x_time += 1

            if gyr_x_time == check_time:
                gyr_x_stat = True
                check_time = 2
                gyr_y_stat = False
                gyr_x_time = -1
                continue

            # GRY_y data
            if gyr_y_stat == False and begin == True:
                if i == 'fe':
                    check_time = 3
                gyr_y.append(i)
                gyr_y_time += 1

            if gyr_y_time == check_time:
                gyr_y_stat = True
                check_time = 2
                gyr_z_stat = False
                gyr_y_time = -1
                continue

            # GRY_z data
            if gyr_z_stat == False and begin == True:
                if i == 'fe':
                    check_time = 3
                gyr_z.append(i)
                gyr_z_time += 1

            if gyr_z_time == check_time:
                gyr_z_stat = True
                check_time = 2
                gyr_z_time = -1
                continue
            if i == '15':
                begin = True
                begin_index = index

        global dec_acc_x
        global dec_acc_y
        global dec_acc_z
        global dec_gyr_x
        global dec_gyr_y
        global dec_gyr_z

        #         print("16 acc_x : ",acc_x)
        dec_acc_x = transfer(acc_x)
        #         print("16 acc_y : ",acc_y)
        dec_acc_y = transfer(acc_y)
        #         print("16 acc_z : ",acc_z)
        dec_acc_z = transfer(acc_z)

        #         print("16 gyr_x : ",gyr_x)
        dec_gyr_x = transfer(gyr_x)
        #         print("16 gyr_y : ",gyr_y)
        dec_gyr_y = transfer(gyr_y)
        #         print("16 gyr_z : ",gyr_z)
        dec_gyr_z = transfer(gyr_z)


def transfer(data):
    if len(data) == 2:
        ans = ''
        for i in data:
            ans = ans + i
    else:
        check = False
        ans = ''
        for index, i in enumerate(data):
            if data[index] == 'fe' and data[index + 1] == 'fd' and index == 0:
                ans = ans + 'fe'
                ans = ans + data[2]
                break
            elif data[index] == 'fe' and data[index + 1] == 'fd' and index == 1:
                ans = ans + data[0]
                ans = ans + 'fe'
                break
            elif data[index] == 'fe' and data[index + 1] == 'fe' and index == 0:
                ans = ans + 'ff'
                ans = ans + data[2]
                break
            elif data[index] == 'fe' and data[index + 1] == 'fe' and index == 1:
                ans = ans + data[0]
                ans = ans + 'ff'
                break
    #     print(len(ans),"////")
    if len(ans) == 0:
        return 0
    else:
        ans_0 = ''
        ans_0 = ans[2] + ans[3] + ans[0] + ans[1]
        return int(ans_0, 16)


def alert():
    process_data()

    dec_acc_x_1 = dec_acc_x
    dec_acc_y_1 = dec_acc_y
    dec_acc_z_1 = dec_acc_z

    dec_gyr_x_1 = dec_gyr_x
    dec_gyr_y_1 = dec_gyr_y
    dec_gyr_z_1 = dec_gyr_z

    process_data()

    #     print("first: ",dec_acc_x_1)
    #     print("second: ",dec_acc_x)

    if abs(dec_acc_x_1 - dec_acc_x) >= 50:
        return 1
    else:
        return 0
