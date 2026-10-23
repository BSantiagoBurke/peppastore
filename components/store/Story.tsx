import styles from "./Story.module.css";

// Textos y datos a validar con la dueña (docs/PROMPT.md, sección 11).
export function Story({ categoryCount }: { categoryCount: number }) {
  return (
    <section className={styles.story} id="historia">
      <div className={`wrap ${styles.inner}`}>
        <div>
          <p className={`eyebrow ${styles.eyebrow}`}>Nosotras</p>
          <h2>
            Nacimos para que <em>nadie</em> llegue vestida igual que vos.
          </h2>
        </div>
        <div>
          <p>
            Peppa empezó hace poco, con una idea simple: buscar la ropa que en Tucumán no se consigue. Cada prenda la
            elegimos pensando en una salida, un cumple, un casamiento o esa noche que venías esperando.
          </p>
          <p>
            Traemos pocas unidades de cada modelo, así que lo que ves acá es lo que hay. Si te gusta algo, escribinos y
            lo reservamos.
          </p>
          <p className={styles.sign}>Con cariño, Peppa</p>
          <div className={styles.facts}>
            <div>
              <b>4</b>
              <small>meses de vida</small>
            </div>
            <div>
              <b>+40</b>
              <small>modelos disponibles</small>
            </div>
            <div>
              <b>{categoryCount}</b>
              <small>categorías</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
