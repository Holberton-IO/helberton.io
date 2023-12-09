from gameserver.game.vector import Vector


class Rectangle:
    def __init__(self, min_vec, max_vec):
        self.min = min_vec
        self.max = max_vec

    def __repr__(self):
        return f"<Rectangle min={self.min} max={self.max}>"

    def clamp(self, rect):
        min_vec = Vector(
            max(self.min.x, rect.min.x),
            max(self.min.y, rect.min.y)
        )
        max_vec = Vector(
            min(self.max.x, rect.max.x),
            min(self.max.y, rect.max.y)
        )
        return Rectangle(min_vec, max_vec)

    def for_each(self):
        for x in range(self.min.x, self.max.x):
            for y in range(self.min.y, self.max.y):
                yield x, y

    def is_rect_overlap(self, rect):
        return self.min.x < rect.max.x and \
               self.max.x > rect.min.x and \
               self.min.y < rect.max.y and \
               self.max.y > rect.min.y

    def is_not_rect_overlap(self, rect):
        return self.max.x < rect.min.x or \
               self.min.x > rect.max.x or \
               self.max.y < rect.min.y or \
               self.min.y > rect.max.y

    def expand_to(self, vector):
        min_vec = Vector(
            min(self.min.x, vector.x),
            min(self.min.y, vector.y)
        )
        max_vec = Vector(
            max(self.max.x, vector.x),
            max(self.max.y, vector.y)
        )
        self.min = min_vec
        self.max = max_vec

    def vector_in_rect(self, vector):
        return self.min.x <= vector.x < self.max.x and self.min.y <= vector.y < self.max.y
