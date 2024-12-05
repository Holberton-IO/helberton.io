from gameserver.game.vector import Vector


class Rectangle:
    def __init__(self, min_vec, max_vec):
        self.min = min_vec
        self.max = max_vec

    def __repr__(self):
        return f"<Rectangle min={self.min} max={self.max}>"

    def clamp_to_min_max(self, min_val, max_val):
        return self.clamp(Rectangle(
            Vector(min_val, min_val),
            Vector(max_val, max_val)
        ))

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
        """
         min Vector is inclusive and max Vector is exclusive
         for example if min = (0,0) and max = (2,2)
         the for_each will yield (0,0), (0,1), (1,0), (1,1)
        :return:
        """
        for x in range(self.min.x, self.max.x):
            for y in range(self.min.y, self.max.y):
                yield x, y

    def __iter__(self):
        """
         min Vector is inclusive and max Vector is exclusive
         for example if min = (0,0) and max = (2,2)
         the for_each will yield (0,0), (0,1), (1,0), (1,1)
        :return:
        """
        yield from self.for_each()

    def is_rect_overlap(self, rect):
        if self.min.x > rect.max.x or self.max.x < rect.min.x:
            return False
        if self.min.y > rect.max.y or self.max.y < rect.min.y:
            return False
        return True

    def is_not_rect_overlap(self, rect):
        return not self.is_rect_overlap(rect)

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

    def expand_to_rect(self, other_rectangle):
        min_vec = Vector(
            min(self.min.x, other_rectangle.min.x),
            min(self.min.y, other_rectangle.min.y)
        )
        max_vec = Vector(
            max(self.max.x, other_rectangle.max.x),
            max(self.max.y, other_rectangle.max.y)
        )
        self.min = min_vec
        self.max = max_vec

    def vector_in_rect(self, vector):
        return self.min.x <= vector.x < self.max.x and self.min.y <= vector.y < self.max.y

    def clone(self):
        return Rectangle(self.min.clone(), self.max.clone())

    def same_as(self, other):
        return self.min == other.min and self.max == other.max

    def all_points_in_border(self):
        for x in range(self.min.x, self.max.x + 1):
            yield x, self.min.y
            yield x, self.max.y
        # exclude the corners
        for y in range(self.min.y + 1, self.max.y):
            yield self.min.x, y
            yield self.max.x, y

    def is_vector_outside(self, vector):
        return (vector.x < self.min.x or vector.x >= self.max.x
                or vector.y < self.min.y or vector.y >= self.max.y)


class RectangleBuilder:
    def __init__(self, v1, v2):
        # self.min = min_vec
        # self.max = Vector(max_vec.x + 1, max_vec.y + 1)
        pass
        # we need to ensure that top left is min and bottom right is max
        self.min = Vector(
            min(v1.x, v2.x),
            min(v1.y, v2.y)
        )
        self.max = Vector(
            max(v1.x, v2.x) + 1,
            max(v1.y, v2.y) + 1
        )

    def build(self):
        return Rectangle(self.min, self.max)
