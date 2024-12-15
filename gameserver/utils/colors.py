class Colors:
    colors = {
        'red2': {
            'brighter': "#E3295E",
            'darker': "#B3224B",
            'slightlyBrighter': "#F02B63",
            'pattern': "#CC2554",
            'patternEdge': "#9C1C40",
        },
        'pink': {
            'brighter': "#A22974",
            'darker': "#7A1F57",
            'pattern': "#8A2262",
            'patternEdge': "#5E1743",
            'slightlyBrighter': "#B02C7E",
        },
        'pink2': {
            'brighter': "#7D26EF",
            'darker': "#5E1DBA",
            'pattern': "#6A21D1",
            'patternEdge': "#4C1896",
            'slightlyBrighter': "#882DFF",
        },
        'purple': {
            'brighter': "#531880",
            'darker': "#391058",
            'pattern': "#4b1573",
            'patternEdge': "#3b115a",
            'slightlyBrighter': "#5a198c",
        },
        'blue': {
            'brighter': "#27409c",
            'darker': "#1d3179",
            'pattern': "#213786",
            'patternEdge': "#1b2b67",
            'slightlyBrighter': "#2a44a9",
        },
        'blue2': {
            'brighter': "#3873E0",
            'darker': "#2754A3",
            'pattern': "#2F64BF",
            'patternEdge': "#1F4587",
            'slightlyBrighter': "#3B79ED",
        },
        'green': {
            'brighter': "#2ACC38",
            'darker': "#1C9626",
            'pattern': "#24AF30",
            'patternEdge': "#178220",
            'slightlyBrighter': "#2FD63D",
        },
        'green2': {
            'brighter': "#1e7d29",
            'darker': "#18561f",
            'pattern': "#1a6d24",
            'patternEdge': "#14541c",
            'slightlyBrighter': "#21882c",
        },
        'leaf': {
            'brighter': "#6a792c",
            'darker': "#576325",
            'pattern': "#5A6625",
            'patternEdge': "#454F1C",
            'slightlyBrighter': "#738430",
        },
        'yellow': {
            'brighter': "#d2b732",
            'darker': "#af992b",
            'pattern': "#D1A932",
            'patternEdge': "#B5922B",
            'slightlyBrighter': "#e6c938",
        },
        'orange': {
            'brighter': "#d06c18",
            'darker': "#ab5a15",
            'pattern': "#AF5B16",
            'patternEdge': "#914A0F",
            'slightlyBrighter': "#da7119",
        },
        'gold': {
            'brighter': "#F6B62C",
            'darker': "#F7981B",
            'pattern': "#DC821E",
            'patternEdge': "#BD6B0E",
            'slightlyBrighter': "#FBDF78",
            'bevelBright': "#F9D485",
        },
        'teal': {
            'brighter': "#20B2AA",
            'darker': "#008080",
            'pattern': "#1E9896",
            'patternEdge': "#167A77",
            'slightlyBrighter': "#2AC4C4"
        },
        'coral': {
            'brighter': "#FF7F50",
            'darker': "#FF5733",
            'pattern': "#FF6B4A",
            'patternEdge': "#FF4500",
            'slightlyBrighter': "#FF8C69"
        },
        'lavender': {
            'brighter': "#9370DB",
            'darker': "#6A5ACD",
            'pattern': "#7B68EE",
            'patternEdge': "#483D8B",
            'slightlyBrighter': "#A569BD"
        },
        'mint': {
            'brighter': "#3CB371",
            'darker': "#2E8B57",
            'pattern': "#2FBC71",
            'patternEdge': "#1D6B3F",
            'slightlyBrighter': "#40E0D0"
        },
        'crimson': {
            'brighter': "#DC143C",
            'darker': "#B22222",
            'pattern': "#CD5C5C",
            'patternEdge': "#8B0000",
            'slightlyBrighter': "#FF4D4D"
        },
        'bronze': {
            'brighter': "#CD7F32",
            'darker': "#B87333",
            'pattern': "#AA6C39",
            'patternEdge': "#8B4513",
            'slightlyBrighter': "#D2691E"
        },
        'slate': {
            'brighter': "#708090",
            'darker': "#4F6367",
            'pattern': "#607080",
            'patternEdge': "#3A4F5A",
            'slightlyBrighter': "#778899"
        },
        'magenta': {
            'brighter': "#C71585",
            'darker': "#8B008B",
            'pattern': "#BA55D3",
            'patternEdge': "#9932CC",
            'slightlyBrighter': "#DA70D6"
        }
    }
    __instance = None

    def __new__(cls, *args, **kwargs):
        if Colors.__instance is None:
            Colors.__instance = object.__new__(cls)
            Colors.__instance.current_color_index = -1
            Colors.__instance.colors_length = len(Colors.colors)
        return Colors.__instance

    def __init__(self, **kwargs):
        pass

    @classmethod
    def get_color(cls, color_name):
        return Colors.colors[color_name]

    @classmethod
    def hex_color_to_int(cls, hex_color):
        if type(hex_color) is int:
            return hex_color

        hex_color = hex_color.lstrip('#')
        number = int(hex_color, 16)
        return number

    def get_random_color(self):
        self.current_color_index += 1
        self.current_color_index %= self.colors_length
        color = self.colors[list(self.colors.keys())[self.current_color_index]]

        for i in color.keys():
            color[i] = Colors.hex_color_to_int(color[i])
        return color
