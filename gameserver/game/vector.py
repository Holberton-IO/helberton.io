import math


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

    def add(self, vector):
        return Vector(self.x + vector.x, self.y + vector.y)

    def is_vector_has_negative(self):
        return self.x < 0 or self.y < 0

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def add_scalar(self, scalar):
        v = Vector(scalar, scalar)
        return self + v

    def clone(self):
        return Vector(self.x, self.y)

    def is_vector_in_map(self, map_size):
        return 0 <= self.x < map_size and 0 <= self.y < map_size

    def distance_to(self, vector):
        return math.sqrt((self.x - vector.x) ** 2 + (self.y - vector.y) ** 2)

    def set(self, vec):
        self.x = vec.x
        self.y = vec.y
        return self

    def set_x(self, pos):
        self.x = pos.x
        return self

    def set_y(self, pos):
        self.y = pos.y
        return self

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)


    def is_in_same_horizontal_line_with(self, other):
        return self.y == other.y

    def is_in_same_vertical_line_with(self, other):
        return self.x == other.x

    def is_horizontal_or_vertical_with(self, other):
        return self.is_in_same_horizontal_line_with(other) or self.is_in_same_vertical_line_with(other)


    def expand_in_all_directions(self, scalar):
        return [
            self.clone().add(Vector(0, scalar)),
            self.clone().add(Vector(0, -scalar)),
            self.clone().add(Vector(scalar, 0)),
            self.clone().add(Vector(-scalar, 0)),
        ]

    def __hash__(self):
        return hash((self.x, self.y))