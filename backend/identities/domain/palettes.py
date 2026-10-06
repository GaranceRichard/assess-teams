from enum import StrEnum


class InterfacePalette(StrEnum):
    GREEN = "green"
    BLUE = "blue"
    PINK = "pink"
    RED = "red"

    @classmethod
    def values(cls) -> tuple[str, ...]:
        return tuple(palette.value for palette in cls)
