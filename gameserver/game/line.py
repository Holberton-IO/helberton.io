from gameserver.game.vector import Vector


class Line:
    def __init__(self, start: 'Vector', end:'Vector'):
        # rearrange the points so that start is always the leftmost Top point
        self.start = start
        self.end = end

        min_x = min(self.start.x, self.end.x)
        max_x = max(self.start.x, self.end.x)
        min_y = min(self.start.y, self.end.y)
        max_y = max(self.start.y, self.end.y)
        self.start = Vector(min_x, min_y)
        self.end = Vector(max_x, max_y)




        if not self.start.is_horizontal_or_vertical_with(self.end):
            raise Exception("Line must be horizontal or vertical not diagonal")


    def check_point_in_line(self, point):
        """
        Ensures the point lies on a horizontal or vertical line segment defined by start and end.

        :param point: Vector
        :return: bool
        """




        # rearrange the points so that start is always the leftmost Top point
        min_x = min(self.start.x, self.end.x)
        max_x = max(self.start.x, self.end.x)
        min_y = min(self.start.y, self.end.y)
        max_y = max(self.start.y, self.end.y)

        if self.start.is_in_same_horizontal_line_with(self.end):
            # Check y-coordinates match and x-coordinate lies in range
            if point.y == self.start.y and min_x <= point.x <= max_x:
                return True

        elif self.start.is_in_same_vertical_line_with(self.end):
            # Check x-coordinates match and y-coordinate lies in range
            if point.x == self.start.x and min_y <= point.y <= max_y:
                return True

        return False


    def __str__(self):
        return f"Line: {self.start} -> {self.end}"

    def for_each(self):
        for x in range(self.start.x, self.end.x + 1):
            for y in range(self.start.y, self.end.y + 1):
                yield x,y