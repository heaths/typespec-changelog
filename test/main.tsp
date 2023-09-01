import "@typespec/http";
import "@typespec/versioning";

using TypeSpec.Http;
using TypeSpec.Versioning;

@service({
  title: "Contoso Widget Manager",
})
@server(
  "{endpoint}",
  "Contoso Widget APIs",
  {
    @doc("Supported Contoso Widget Manager endpoints.")
    endpoint: string,
  }
)
@versioned(Contoso.Versions)
namespace Contoso;

enum Versions {
  @doc("Version 2023-09-01")
  "2023-09-01",

  @doc("Version 2023-08-01")
  "2023-08-01",
}

model Widget {
  @key("widgetName")
  @doc("Name of the widget")
  name: string;

  @added(Versions.`2023-09-01`)
  @doc("Color of the widget")
  color?: WidgetColor;
}

@added(Versions.`2023-09-01`)
enum WidgetColor {
  @doc("Red")
  Red,

  @doc("Green")
  Green,

  @doc("Blue")
  Blue,
}
