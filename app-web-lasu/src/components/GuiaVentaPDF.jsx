import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
// Asumiendo que tu logo está en src/assets/
// ¡Asegúrate de importar tu logo!
import logoLasu from '../assets/logo_lasu.png'; 

// --- Estilos (traducción de tu layout de TCPDF) ---
const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, padding: 10, margin: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  headerLeft: { flexDirection: 'row', width: '70%' },
  logo: { width: 30, height: 30, marginRight: 5 },
  duenoInfo: { width: '70%' },
  duenoDesc: { fontSize: 9, fontWeight: 'bold', width: '90%' },
  duenoNombre: { fontSize: 9, fontWeight: 'bold' },
  headerRight: { width: '30%', textAlign: 'center' },
  guiaBox: { border: '1px solid black', padding: 3, marginBottom: 2 },
  guiaTitle: { fontSize: 10, fontWeight: 'bold' },
  guiaId: { fontSize: 10 },
  
  duenoContacto: { fontSize: 8, marginTop: -15, marginLeft: 35, width: '60%' },
  
  clienteSection: { border: '1px solid black', padding: 5, marginTop: 10 },
  clienteRow: { flexDirection: 'row', marginBottom: 2 },
  clienteLabel: { fontSize: 8, width: '20%', fontWeight: 'bold' },
  clienteValue: { fontSize: 8, width: '80%' },
  clienteLabelSmall: { fontSize: 8, width: '10%', fontWeight: 'bold' },
  clienteValueSmall: { fontSize: 8, width: '25%' },

  table: { display: 'table', width: 'auto', border: '1px solid black', marginTop: 5 },
  tableRow: { flexDirection: 'row', borderTop: '1px solid black' },
  tableColHeader: { fontWeight: 'bold', fontSize: 8, textAlign: 'center', padding: 3, borderRight: '1px solid black' },
  tableCol: { fontSize: 8, padding: 3, borderRight: '1px solid black' },
  
  colCant: { width: '10%', textAlign: 'center' },
  colDesc: { width: '55%', textAlign: 'left' },
  colPUnit: { width: '17.5%', textAlign: 'right' },
  colImporte: { width: '17.5%', textAlign: 'right', borderRight: 0 },
  
  totalRow: { flexDirection: 'row', borderTop: '1px solid black' },
  totalLabel: { width: '82.5%', fontWeight: 'bold', fontSize: 8, textAlign: 'right', padding: 3, borderRight: '1px solid black' },
  totalValue: { width: '17.5%', fontWeight: 'bold', fontSize: 8, textAlign: 'right', padding: 3 },
  
  creditoBox: { border: '1px solid black', marginTop: 5, padding: 3 },
  creditoTitle: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', marginBottom: 3 },
  creditoRow: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, marginBottom: 2 },
  
  footer: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-around' },
  footerText: { fontSize: 8, textAlign: 'center' },
  footerTitulo: { fontSize: 8, color: 'red', marginTop: 8, textAlign: 'center' }
});

const DuenoDatos = {
  nombreDue: "FRANCISCO SUMARI CHANCAS",
  DescNegocio: "DISTRIBUCIÓN DE GRIFERÍAS EN GENERAL, ACCESORIOS Y SUMINISTROS EN MARCA ISAGRIF, FAVINSA Y OTROS",
  DueTel: "963747619",
  DueDirec: "CALLE ENRIQUE LOPEZ ALBUJAR MZ. H LT. 17 URB. ALBINO HERRERA PROV. CONST. CALLAO"
};

const DibujarGuia = ({ venta, detalle, tituloPie }) => (
  <View>
    {/* --- ENCABEZADO --- */}
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image style={styles.logo} src={logoLasu} />
        <View style={styles.duenoInfo}>
          <Text style={styles.duenoDesc}>{DuenoDatos.DescNegocio}</Text>
          <Text style={styles.duenoNombre}>DE: {DuenoDatos.nombreDue.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.guiaBox}>
          <Text style={styles.guiaTitle}>GUIA DE PEDIDOS</Text>
        </View>
        <View style={styles.guiaBox}>
          <Text style={styles.guiaId}>002 - {venta.idVenta.slice(-5)}</Text>
        </View>
      </View>
    </View>
    <Text style={styles.duenoContacto}>
      TEL: {DuenoDatos.DueTel}{"\n"}
      {DuenoDatos.DueDirec}
    </Text>

    {/* --- DATOS DEL CLIENTE --- */}
    {/* NOTA IMPORTANTE: Tu API de /api/ventas debe devolver estos campos
      (rucCliente, refCliente, distritoCliente) para que aparezcan aquí.
      Asegúrate de hacer un JOIN con la tabla Clientes en tu backend.
    */}
    <View style={styles.clienteSection}>
      <View style={styles.clienteRow}>
        <Text style={styles.clienteLabel}>CLIENTE:</Text>
        <Text style={styles.clienteValue}>{venta.nombreCliente}</Text>
      </View>
      <View style={styles.clienteRow}>
        <Text style={styles.clienteLabelSmall}>RUC:</Text>
        <Text style={styles.clienteValueSmall}>{venta.rucCliente || 'N/A'}</Text>
        <Text style={styles.clienteLabelSmall}>REF:</Text>
        <Text style={styles.clienteValueSmall}>{venta.refCliente || 'N/A'}</Text>
        <Text style={styles.clienteLabelSmall}>FECHA:</Text>
        <Text style={styles.clienteValueSmall}>{new Date(venta.Fecha_Venta).toLocaleDateString()}</Text>
      </View>
      <View style={styles.clienteRow}>
        <Text style={styles.clienteLabel}>DIRECCION:</Text>
        <Text style={styles.clienteValue}>{venta.distritoCliente || 'N/A'}</Text>
      </View>
       <View style={styles.clienteRow}>
        <Text style={styles.clienteLabel}>METODO PAGO:</Text>
        <Text style={styles.clienteValue}>{venta.nombreMetodo}</Text>
      </View>
    </View>
    
    {/* --- TABLA DE PRODUCTOS --- */}
    <View style={styles.table}>
      {/* Encabezado */}
      <View style={styles.tableRow} fixed>
        <Text style={[styles.tableColHeader, styles.colCant]}>CANT.</Text>
        <Text style={[styles.tableColHeader, styles.colDesc]}>DESCRIPCION</Text>
        <Text style={[styles.tableColHeader, styles.colPUnit]}>P. UNITARIO</Text>
        <Text style={[styles.tableColHeader, styles.colImporte]}>IMPORTE</Text>
      </View>
      {/* Filas */}
      {detalle.map((p, i) => (
        <View style={styles.tableRow} key={i} wrap={false}>
          <Text style={[styles.tableCol, styles.colCant]}>{p.CantidadProduc}</Text>
          <Text style={[styles.tableCol, styles.colDesc]}>{p.nomProduc}</Text>
          <Text style={[styles.tableCol, styles.colPUnit]}>S/ {Number(p.precioProduc).toFixed(2)}</Text>
          <Text style={[styles.tableCol, styles.colImporte]}>S/ {Number(p.Subtotal).toFixed(2)}</Text>
        </View>
      ))}
      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalValue}>S/ {Number(venta.Total).toFixed(2)}</Text>
      </View>
    </View>

    {/* --- CUADRO DE CRÉDITO --- */}
    {venta.tipoVenta.toLowerCase() === 'crédito' && (
      <View style={styles.creditoBox}>
        <Text style={styles.creditoTitle}>DETALLE DE PAGO A CRÉDITO</Text>
        <View style={styles.creditoRow}>
          <Text>MONTO TOTAL: S/ {Number(venta.Total).toFixed(2)}</Text>
          <Text>MONTO PAGADO: S/ {Number(venta.montoPagadoInicial).toFixed(2)}</Text>
        </View>
        <Text style={styles.creditoRow}>ESTADO DEL PAGO: {venta.estadoPago.toUpperCase()}</Text>
      </View>
    )}
    
    {/* --- PIE DE PÁGINA --- */}
    <View style={styles.footer}>
      <Text style={styles.footerText}>RECIBÍ CONFORME</Text>
      <Text style={styles.footerText}>CANCELADO</Text>
    </View>
    <Text style={styles.footerTitulo}>{tituloPie.toUpperCase()}</Text>
  </View>
);

// --- Componente principal del Documento ---
export function GuiaVentaPDF({ venta, detalle }) {
  if (!venta || !detalle) return null;

  return (
    <Document>
      {/* Página 1: ADQUIRENTE */}
      <Page size="A4" style={styles.page}>
        <DibujarGuia venta={venta} detalle={detalle} tituloPie="ADQUIRENTE" />
      </Page>
      {/* Página 2: EMISOR */}
      <Page size="A4" style={styles.page}>
        <DibujarGuia venta={venta} detalle={detalle} tituloPie="EMISOR" />
      </Page>
    </Document>
  );
}