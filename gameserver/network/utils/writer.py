class Writer:
    def __init__(self, packet_id):
        self.buffer = bytearray(20)
        self.packet_id = packet_id
        self.offset = 0
        self.write_packet_id()

    def write_packet_id(self):
        self.offset = 2
        self.write_int_in_bytes(self.packet_id, 2)
        self.update_packet_size()

    def write_byte_array(self, byte_array_of_data):
        for i in range(len(byte_array_of_data)):
            self.buffer[self.offset] = byte_array_of_data[i]
            self.offset += 1

    def ensure_buffer_size(self, size):
        if self.offset + size > len(self.buffer):
            new_size = size + len(self.buffer) * 2
            new_buffer = bytearray(new_size)
            new_buffer[0:len(self.buffer)] = self.buffer
            self.buffer = new_buffer

    def write_int_in_bytes(self, number, bytes_number=2):
        b = number.to_bytes(bytes_number, 'little')
        self.ensure_buffer_size(bytes_number)
        self.write_byte_array(b)
        self.update_packet_size()

    def write_string(self, s: str):
        self.write_int_in_bytes(len(s), 2)
        self.ensure_buffer_size(len(s))
        self.write_byte_array(s.encode('utf-8'))
        self.update_packet_size()

    def update_packet_size(self):
        packet_size = self.offset
        self.buffer[0:2] = packet_size.to_bytes(2, 'little')

    def finalize(self):
        return self.buffer[0:self.offset]

    def to_hex_string(self):
        return " ".join("{:02x}".format(c) for c in self.buffer)
