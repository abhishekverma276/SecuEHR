import { MigrationInterface, QueryRunner, TableColumn, TableUnique  } from "typeorm";

export class UpdateUserTable1743055248904 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         // Add email column
         await queryRunner.addColumn("user", new TableColumn({
            name: "email",
            type: "varchar",
            length: "255",
            isNullable: false,
        }));

        // Add unique constraint to email
        await queryRunner.createUniqueConstraint("user", new TableUnique({
            columnNames: ["email"],
        }));

        // Add token column
        await queryRunner.addColumn("user", new TableColumn({
            name: "resetToken",
            type: "varchar",
            length: "255",
            isNullable: true,
        }));

        // Add tokenExpiry column
        await queryRunner.addColumn("user", new TableColumn({
            name: "resetTokenExpiry",
            type: "timestamp",
            isNullable: true,
        }));        
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove unique constraint before dropping the column
        await queryRunner.dropUniqueConstraint("user", "users_email_unique");

        // Drop columns
        await queryRunner.dropColumn("user", "email");
        await queryRunner.dropColumn("user", "resetToken");
        await queryRunner.dropColumn("user", "resetTokenExpiry");
    }

}
