from gameserver.game.vector import Vector


class Line:
    def __init__(self, start, end):
        self.start = start
        self.end = end

    def check_point_in_line(self, point):
        """
        :param point: Vector
        :return: bool
        """
        # rearrange the points so that start is always the leftmost Top point
        min_x = min(self.start.x, self.end.x)
        max_x = max(self.start.x, self.end.x)
        min_y = min(self.start.y, self.end.y)
        max_y = max(self.start.y, self.end.y)
        start = Vector(min_x, min_y)
        end = Vector(max_x, max_y)

        # check if the point is in the line
        return start.x <= point.x <= end.x \
               and start.y <= point.y <= end.y
