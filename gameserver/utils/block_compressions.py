from dataclasses import dataclass

from gameserver.game.rect import Rectangle
from gameserver.game.vector import Vector


class CustomBool:
    def __init__(self, value):
        self.value = value

    def __bool__(self):
        if self.value is None:
            return False
        return True
@dataclass
class Column:
    start: int
    end: int
    data: object


class BlockCompression:
    def __init__(self, block_list, callback):
        self.block_list = block_list
        self.call_back = callback



    def collect_section_vertically(self, x, rectangle):
        sections = []
        current_column = None
        for y in range(rectangle.min.y, rectangle.max.y + 1):
            data = CustomBool(None)
            if y < rectangle.max.y:
                data = CustomBool(self.call_back(x, y))

            if (data and not current_column) or \
                    (current_column and data.value != current_column.data):

                current_column = None
                if data:
                    current_column = Column(y, y + 1, data.value)
                    sections.append(current_column)
            else:
                if current_column:
                    current_column.end = y + 1

        return sections

    def columns_are_equal(self, sections_a, sections_b):
        if len(sections_a) != len(sections_b):
            return False

        for section_a, section_b in zip(sections_a, sections_b):
            if section_a.start != section_b.start:
                return False
            if section_a.end != section_b.end:
                return False
            if section_a.data != section_b.data:
                return False

        return True

    def compress_inside_rectangle(self, rectangle):
        recs = []
        prev_column = []
        columns_with_same_data = 0

        """
        Try To Compress Horizontally
        """
        for x in range(rectangle.min.x, rectangle.max.x + 1):
            sections = []
            if x < rectangle.max.x:
                sections = self.collect_section_vertically(x, rectangle)

            if self.columns_are_equal(prev_column, sections):
                columns_with_same_data += 1
            else:
                for section in prev_column:
                    rec = Rectangle(
                        Vector(x - columns_with_same_data - 1, section.start),
                        Vector(x, section.end)
                    )
                    recs.append({
                        "rect": rec,
                        "data": section.data
                    })
                columns_with_same_data = 0
                prev_column = sections
        return recs
