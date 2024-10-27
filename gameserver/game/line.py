from gameserver.game.vector import Vector


class Line:
    def __init__(self, start: 'Vector', end:'Vector'):
        self.start = start
        self.end = end
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
        start = Vector(min_x, min_y)
        end = Vector(max_x, max_y)

        if start.is_in_same_horizontal_line_with(end):
            if  start.x <= point.x <= end.x:
                return True

        elif start.is_in_same_vertical_line_with(end):
            if start.y <= point.y <= end.y:
                return True

        return False

        # check if
