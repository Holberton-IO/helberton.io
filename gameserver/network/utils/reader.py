class Reader:
    def __init__(self, buffer: bytearray):
        self.buffer = buffer
        self.offset = 0

    def move_cursor(self, offset):
        self.offset += offset

    def read_byte(self, size):
        result = self.buffer[self.offset:self.offset + size]
        self.offset += size
        return result

    def read_int(self, size):
        number = 0
        for i in range(size):
            number = number | self.buffer[self.offset] << (8 * i)
            self.offset += 1
        return number

    def read_int_1(self):
        return self.read_int(1)

    def read_int_2(self):
        return self.read_int(2)

    def read_int_4(self):
        return self.read_int(4)

    def read_int_8(self):
        return self.read_int(8)

    def read_string(self):
        size = self.read_int_2()
        return self.read_byte(size).decode('utf-8')

    def to_hex_string(self):
        return " ".join("{:02x}".format(c) for c in self.buffer)
