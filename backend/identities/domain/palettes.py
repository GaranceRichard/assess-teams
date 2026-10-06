from enum import StrEnum


class InterfacePalette(StrEnum):
    GREEN = "green"
    BLUE = "blue"
    PINK = "pink"
    RED = "red"
    INDIGO = "indigo"
    VIOLET = "violet"
    ORANGE = "orange"
    AMBER = "amber"
    EMERALD = "emerald"
    TURQUOISE = "turquoise"

    @classmethod
    def values(cls) -> tuple[str, ...]:
        return tuple(palette.value for palette in cls)
