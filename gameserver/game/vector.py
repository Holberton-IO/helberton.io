class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"<Vector x={self.x} y={self.y}>"

    def get_vector_from_direction(self, direction):
        direction_vector = Vector(0, 0)
        if direction == "up":
            direction_vector = Vector(0, -1)
        elif direction == "down":
            direction_vector = Vector(0, 1)
        elif direction == "left":
            direction_vector = Vector(-1, 0)
        elif direction == "right":
            direction_vector = Vector(1, 0)
        else:
            raise Exception("Invalid Direction")

        return direction_vector + self

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def add_scalar(self, scalar):
        v = Vector(scalar, scalar)
        return self + v

    def clone(self):
        return Vector(self.x, self.y)

    def is_vector_in_map(self, map_size):
        return 0 <= self.x < map_size and 0 <= self.y < map_size
