-- Renombra las unidades de 81Living de 1/2/3 a A/B/C (solo si ya las creaste con el nombre anterior).
update public.listings set name = '81Living - Piso 6 - Unidad A' where name = '81Living - Piso 6 - Unidad 1';
update public.listings set name = '81Living - Piso 6 - Unidad B' where name = '81Living - Piso 6 - Unidad 2';
update public.listings set name = '81Living - Piso 6 - Unidad C' where name = '81Living - Piso 6 - Unidad 3';
