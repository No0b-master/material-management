import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('cost_centers').del();
  await knex('cost_centers').insert([
    { n3_code: '13', description: 'New Parts Development - Operations', cost_center: '24307', hod_name: 'Deepak Malhotra' },
    { n3_code: '16', description: 'Engine Design and Testing', cost_center: '22217', hod_name: 'Shakti Kumar Singh' },
    { n3_code: '16', description: 'Engine Testing Lab', cost_center: '22214', hod_name: 'Shakti Kumar Singh' },
    { n3_code: '17', description: 'Transmission and Hydraulic Design', cost_center: '22202', hod_name: 'Sayyed Suheal Ahmed' },
    { n3_code: '21', description: 'Photoshop and Testing', cost_center: '22208', hod_name: 'Chanchal Singh Negi' },
    { n3_code: '22', description: 'Strategic Sourcing', cost_center: '22207', hod_name: 'Pavan Vir Singh' },
    { n3_code: '23', description: 'Product Planning - R&D', cost_center: '22223', hod_name: 'Sandeep Singh' },
    { n3_code: '24', description: 'Vehicle Design', cost_center: '22203', hod_name: 'Jaswinder Singh' },
    { n3_code: '57', description: 'Project Management', cost_center: '22210', hod_name: 'Manish Kumar Chhabra' },
    { n3_code: '60', description: 'Agri Solutions Product Development', cost_center: '22201', hod_name: 'Hisashi Tsukatani' },
    { n3_code: '62', description: 'Plant Engineering & Process Control', cost_center: '22221', hod_name: 'Shyam Yadav' },
    { n3_code: '63', description: 'RNIL', cost_center: '22239', hod_name: 'Shyam Yadav' },
    { n3_code: '64', description: 'R&D Shared Service', cost_center: '22241', hod_name: 'Shyam Yadav' },
    { n3_code: '65', description: 'Core of Excellence', cost_center: '22229', hod_name: 'Anish Dhir' },
    { n3_code: '66', description: 'Styling Design', cost_center: '22203', hod_name: 'Anish Dhir' },
    { n3_code: '67', description: 'PLM & BOM', cost_center: '22205', hod_name: 'Anish Dhir' },
    { n3_code: '68', description: 'NPD R&D / EV / Metrology Lab', cost_center: '22204', hod_name: 'Anish Dhir' },
    { n3_code: '69', description: 'Material Science / Engineering Svcs', cost_center: '22211', hod_name: 'Rahul Patil' },
  ]);
}
