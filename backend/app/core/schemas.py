from pydantic import ConfigDict, model_validator
from sqlmodel import SQLModel


class Schema(SQLModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        extra="forbid",
        allow_inf_nan=False,
    )


class PartialSchema(Schema):
    @model_validator(mode="after")
    def reject_explicit_null(self):
        for name in self.model_fields_set:
            if getattr(self, name) is None:
                raise ValueError(
                    f"{name} no admite null; omitirlo conserva el valor actual"
                )
        return self
