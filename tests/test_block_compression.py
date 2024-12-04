"""
Comprehensive test suite for the BlockCompression module.
Tests various scenarios and edge cases for block compression functionality.
"""

import unittest
from gameserver.game.rect import Rectangle
from gameserver.game.vector import Vector
from gameserver.utils.block_compressions import BlockCompression, CustomBool, Column


class TestBlockCompression(unittest.TestCase):
    def setUp(self):
        """Set up base test configuration."""
        self.empty_grid = [[]]
        self.single_cell_grid = [[1]]
        self.uniform_grid = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ]
        self.mixed_grid = [
            [1, 1, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [2, 2, 2, 2]
        ]
        self.checkerboard_grid = [
            [1, 0, 1, 0],
            [0, 1, 0, 1],
            [1, 0, 1, 0],
            [0, 1, 0, 1]
        ]
        self.l_shape_grid = [
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0]
        ]
